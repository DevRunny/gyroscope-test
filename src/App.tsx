import { type MutableRefObject, useEffect, useRef, useState } from "react";

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
	requestPermission?: () => Promise<"granted" | "denied">;
}

export function App() {
	const [absolute, setAbsolute] = useState<boolean>(false);
	const [rotX, setRotX] = useState(0);
	const [rotY, setRotY] = useState(0);
	const [rotZ, setRotZ] = useState(0);
	const [accX, setAccX] = useState(0);
	const [accY, setAccY] = useState(0);
	const [accZ, setAccZ] = useState(0);
	const [ballX, setBallX] = useState(0);
	const [ballY, setBallY] = useState(0);
	const [moveX, setMoveX] = useState(0);
	const [moveY, setMoveY] = useState(0);
	const [looping, setLooping] = useState(false);
	const [gravity, setGravity] = useState(false);
	const [activeLooping, setActiveLooping] = useState(false);
	const [activeGravity, setActiveGravity] = useState(false);
	const [currentScreenOrientation, setCurrentScreenOrientation] = useState(
		window.screen.orientation || 0,
	);
	const refBall = useRef() as MutableRefObject<HTMLDivElement>;

	function clamp(num: number, min: number, max: number) {
		return num <= min ? min : num >= max ? max : num;
	}

	const requestPermission = (
		DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
	).requestPermission;
	const iOS = typeof requestPermission === "function";

	async function handleClickStart() {
		if (iOS) {
			const response = await requestPermission();
			if (response === "granted") {
				if (looping) {
					setActiveLooping(false);
					setLooping(false);
					setActiveGravity(false);
					setGravity(false);
				}
				if (!looping) {
					setActiveLooping(true);
					setLooping(true);
				}
			}
		}
		if (!iOS) {
			if (looping) {
				setActiveLooping(false);
				setLooping(false);
				setActiveGravity(false);
				setGravity(false);
			}
			if (!looping) {
				setActiveLooping(true);
				setLooping(true);
			}
		}
	}
	async function handleClickGravity() {
		if (iOS) {
			const response = await requestPermission();
			if (response === "granted") {
				if (gravity) {
					setActiveGravity(false);
					setGravity(false);
				}
				if (!gravity && looping) {
					setActiveGravity(true);
					setGravity(true);
				}
			}
		}

		if (!iOS) {
			if (gravity) {
				setActiveGravity(false);
				setGravity(false);
			}
			if (!gravity && looping) {
				setActiveGravity(true);
				setGravity(true);
			}
		}
	}

	useEffect(() => {
		window.addEventListener(
			"deviceorientation",
			(event) => {
				if (event.alpha && event.beta && event.gamma) {
					setAbsolute(event.absolute);
					// X -180 - 180
					setRotX(Number(event.beta.toFixed(2)));
					// Y -90 - 90, loops twice over
					setRotY(Number(event.gamma.toFixed(2)));
					// Z 0 - 360
					setRotZ(Number(event.alpha.toFixed(2)));
				}
			},
			false,
		);
		return () => {
			window.removeEventListener(
				"deviceorientation",
				(event) => {
					if (event.alpha && event.beta && event.gamma) {
						setAbsolute(event.absolute);
						// X -180 - 180
						setRotX(Number(event.beta.toFixed(2)));
						// Y -90 - 90, loops twice over
						setRotY(Number(event.gamma.toFixed(2)));
						// Z 0 - 360
						setRotZ(Number(event.alpha.toFixed(2)));
					}
				},
				false,
			);
		};
	}, []);

	useEffect(() => {
		function handleMotionEvent(event: DeviceMotionEvent) {
			if (
				event?.accelerationIncludingGravity?.x &&
				event.accelerationIncludingGravity.y &&
				event.accelerationIncludingGravity.z
			) {
				// with gravity 9,807 m/s²
				setAccX(Number(event.accelerationIncludingGravity.x.toFixed(2)));
				setAccY(Number(event.accelerationIncludingGravity.y.toFixed(2)));
				setAccZ(Number(event.accelerationIncludingGravity.z.toFixed(2)));
			}
		}
		window.addEventListener("devicemotion", handleMotionEvent, true);
	}, []);

	useEffect(() => {
		window.addEventListener(
			"orientationchange",
			() => {
				setCurrentScreenOrientation(window.screen.orientation);
			},
			false,
		);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (refBall.current && looping) {
			const ballStyle = refBall.current.style;

			if (gravity) {
				setMoveX(accX * (iOS ? 1 : -1));
				setMoveY(accY * (iOS ? -1 : 1));
				setBallX(ballX + moveX);
				setBallY(ballY + moveY);
				setBallX((prev) => clamp(prev, 0, 288));
				setBallY((prev) => clamp(prev, 0, 288));
				ballStyle.top = `${ballY}px`;
				ballStyle.left = `${ballX}px`;
			} else {
				setBallX(clamp(rotX, -29, 29) * 5 + 144);
				setBallY(clamp(rotY, -29, 29) * 5 + 144);
				ballStyle.top = `${ballX}px`;
				ballStyle.left = `${ballY}px`;
			}
		}
		if (!looping) {
			const ballStyle = refBall.current.style;
			setBallX(0);
			setBallY(0);
			ballStyle.top = `${ballX}px`;
			ballStyle.left = `${ballY}px`;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accX, accY, gravity, moveX, moveY, rotX, rotY, looping]);

	return (
		<>
			<h1>Гироскоп тест</h1>
			<div id="data">
				{looping && (
					<p>
						Absolute (z 0 is north): {absolute ? "true" : "false"}
						<br />
						Вращение(Rotation) X {rotX}
						<br />
						Вращение(Rotation) Y {rotY}
						<br />
						Вращение(Rotation) Z {rotZ}
						<br />
						Ускорение(Acceleration) X {accX}
						<br />
						Ускорение(Acceleration) Y {accY}
						<br />
						Ускорение(Acceleration) Z {accZ}
						<br />
						Экран повернут на {currentScreenOrientation.angle} градусов
					</p>
				)}
				{!looping && (
					<p>
						Телефон и браузер должны поддерживать датчики движения, и их
						использование должно быть разрешено для этого сайта. <br />
						Удерживайте телефон экраном вверх и нажмите "Старт". Поверните
						телефон, чтобы проверить данные датчиков. <br /> Визуальное
						представление использует оси X и Y, поворот ограничен 30 градусами.
					</p>
				)}
			</div>
			<br />
			<button
				onClick={handleClickStart}
				type="button"
				id="loop"
				className={activeLooping ? "black" : ""}
			>
				Старт / Стоп
			</button>
			<button
				onClick={handleClickGravity}
				type="button"
				id="gravity"
				className={activeGravity ? "black" : ""}
				disabled={!looping}
			>
				Ускорение & Гравитация
			</button>
			<div id="field">
				<div ref={refBall} id="ball" />
			</div>
			<div id="coords" />
		</>
	);
}
