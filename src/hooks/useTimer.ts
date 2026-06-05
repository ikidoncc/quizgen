import { useEffect, useRef } from "react";

export function useTimer(
	isActive: boolean,
	timeLeft: number,
	onTick: (time: number) => void,
	onTimeout: () => void,
) {
	const intervalRef = useRef<number | null>(null);
	const timeLeftRef = useRef(timeLeft);
	const onTickRef = useRef(onTick);
	const onTimeoutRef = useRef(onTimeout);

	useEffect(() => {
		timeLeftRef.current = timeLeft;
		onTickRef.current = onTick;
		onTimeoutRef.current = onTimeout;
	}, [timeLeft, onTick, onTimeout]);

	useEffect(() => {
		if (isActive && timeLeftRef.current > 0) {
			intervalRef.current = window.setInterval(() => {
				const nextTime = timeLeftRef.current - 1;
				onTickRef.current(nextTime);
				
				if (nextTime === 0) {
					if (intervalRef.current) clearInterval(intervalRef.current);
					onTimeoutRef.current();
				}
			}, 1000);
		} else if (isActive && timeLeftRef.current === 0) {
			onTimeoutRef.current();
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isActive]);

	const stopTimer = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
	};

	return { stopTimer };
}
