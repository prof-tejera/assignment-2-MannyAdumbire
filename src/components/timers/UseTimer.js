import { useState, useRef, useEffect } from "react";
import * as h from "../../utils/helpers.js";

export const useTimer = (opt) => {
  // Props that should cause component rerender.
  const [isRunning, setIsRunning] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [reset, setReset] = useState(true);
  const [fastForward, setFastForward] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [secsLeft, setSecsLeft] = useState(0);

  /** 
   * Props that shouldn't cause rerender.
   */ 
  // Internal, high resolution, state of the timer.
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
    msLeft.current = h.msFromMinsSecs(opt.minutesPerRound, opt.secondsPerRound);
    setSecsLeft(h.secsFromMinsSecs(opt.minutesPerRound, opt.secondsPerRound));
  }
  // Fast forward the timer.
  function fastForwardFn() {
    setIsRunning(false);
    setFastForward(false);
    setIsRest(true);
    setRoundNumber(opt.roundsTotal);
    msLeft.current = 0;
    setSecsLeft(0);
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
        msLeft.current -= timerFrequency;
        // Update the displayed time left.
        console.info(msLeft.current);
        if (msLeft.current >= timerFrequency) {
          // Only cause a rerender on the update frequestion, and on the last "tick".
          if (msLeft.current % msUpdateFrequency === 0) {
            setSecsLeft( msLeft.current / 1000 );
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
              setSecsLeft(h.secsFromMinsSecs( opt.minutesRest ,opt.secondsRest));
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
    isRunning: isRunning,
    secsLeft: secsLeft,
    isRest: isRest,
    setReset: setReset,
    roundNumber: roundNumber,
    setIsRunning: setIsRunning,
    setFastForward: setFastForward,
  };
};
