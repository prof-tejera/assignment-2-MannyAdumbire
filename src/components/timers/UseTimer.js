import { useState, useRef, useEffect } from "react";
import * as h from "../../utils/helpers.js";

export const useTimer = (opt) => {
  // Props that should cause component rerender.
  const [isRunning, setIsRunning] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [reset, setReset] = useState(true);
  const [fastForward, setFastForward] = useState(false);
  const [secsLeft, setSecsLeft] = useState(0);
  const [minsLeft, setMinsLeft] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);

  // Props that shouldn't cause rerender.
  const msLeft = useRef(0);

  // The Intervals that progress the timer.
  const roundIntervalRef = useRef(null);

  // Logic for rounds.
  useEffect(() => {
    const timerFrequency = 250;
    const timerUpdateFactor = 4;
    // Set the above such that this comes out to 1 second.
    const msUpdateFrequency = timerFrequency * timerUpdateFactor;

    if (reset) {
      resetFn();
      setReset(false);
    }
    if (fastForward) {
      fastForwardFn();
      setFastForward(false);
    }
  // Reset the timer.
  function resetFn() {
    setIsRunning(false);
    setIsRest(false);
    setFastForward(false);
    setRoundNumber(1);
    msLeft.current = 0;
    setSecsLeft(opt.secondsPerRound);
    setMinsLeft(opt.minutesPerRound);
  }
  // Fast forward the timer.
  function fastForwardFn() {
    setIsRunning(false);
    setFastForward(false);
    setIsRest(true);
    msLeft.current = 0;
    setRoundNumber(opt.roundsTotal);
    setSecsLeft(0);
    setMinsLeft(0);
  }
    // If the timer isn't running or it's a rest period.
    if (!isRunning) {
      // cleanup the Interval
      roundIntervalRef.current && clearInterval(roundIntervalRef.current);
    } else {
      // setup new Interval.
      roundIntervalRef.current = setInterval(() => {
        if (!roundNumber) {
          setRoundNumber(1);
        }
        if (!msLeft.current) {
          // get the total number of ms for the round.
          msLeft.current = h.msFromMinsSecs(
            opt.minutesPerRound,
            opt.secondsPerRound
          );
        } 
        let [minsLeft, secsLeft] = h.minsSecsFromMs(msLeft.current);
        msLeft.current -= timerFrequency;
        // Update the displayed time left.
        if (msLeft.current >= timerFrequency) {
          // Only cause a rerender on the update frequestion, and on the last "tick".
          if (msLeft.current % msUpdateFrequency === 0 || msLeft.current === timerFrequency) {
            setMinsLeft(minsLeft);
            setSecsLeft(secsLeft);
          }
        } else {
          // Are there still rounds left?
          if (roundNumber < opt.roundsTotal) {
            // Is there a rest period?
            if (
              (opt.minutesRest || opt.secondsRest) &&
              !isRest
            ) {
              // Initiate the rest period.
              setSecsLeft(opt.secondsRest);
              setMinsLeft(opt.minutesRest);
              msLeft.current = h.msFromMinsSecs(
                opt.minutesRest,
                opt.secondsRest
              );
              setIsRest(true);
            } else {
              // Go to the next round.
              setRoundNumber((prev) => prev + 1);
              msLeft.current = h.msFromMinsSecs(
                opt.minutesPerRound,
                opt.secondsPerRound
              );
              setIsRest(false);
            }
          } else {
            // No more rounds left.
            setIsRunning(false);
          }
        }
      }, timerFrequency);
    }
    return () => {
      // cleanup the Interval.
      if (roundIntervalRef.current) {
        clearInterval(roundIntervalRef.current);
      }
    };
  }, [isRunning, isRest, reset, fastForward, roundNumber, opt]);

  return {
    isRest: isRest,
    isRunning: isRunning,
    minsLeft: minsLeft,
    secsLeft: secsLeft,
    roundNumber: roundNumber,
    setReset: setReset,
    setIsRunning: setIsRunning,
    setFastForward: setFastForward,
  };

};
