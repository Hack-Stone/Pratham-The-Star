"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { Mrs_Saint_Delafield } from "next/font/google"

const mrsSaintDelafield = Mrs_Saint_Delafield({
  weight: "400",
  subsets: ["latin"],
  display: "block",
  fallback: ["cursive"],
})

const TIP_COLOR = "#7CFFC4"

export function IntroLoader() {
  const [shouldRender, setShouldRender] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem("intro-seen", "true")
    } catch {}
    document.body.style.overflow = ""
    setShouldRender(false)
  }, [])

  const startFadeOut = useCallback((durationMs = 600) => {
    setIsFadingOut(true)
    const t = setTimeout(() => {
      finishIntro()
    }, durationMs)
    timersRef.current.push(t)
  }, [finishIntro])

  const handleSkip = useCallback(() => {
    if (isFadingOut) return
    clearAllTimers()
    startFadeOut(350)
  }, [isFadingOut, clearAllTimers, startFadeOut])

  useEffect(() => {
    // Check if intro has already been seen in this session
    try {
      if (sessionStorage.getItem("intro-seen") === "true") {
        setShouldRender(false)
        return
      }
    } catch {}

    // Lock scroll during intro
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // Check for prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (motionQuery.matches) {
      // Show finished signature for 0.8s, then fade out
      const tHold = setTimeout(() => {
        startFadeOut(500)
      }, 800)
      timersRef.current.push(tHold)
      return () => {
        clearAllTimers()
        document.body.style.overflow = originalOverflow
      }
    }

    // Normal sequence:
    // 0 - 0.4s: pen tip fades in at the left
    // 0.4 - 3.2s: "Pratham" writes itself, pen tip follows leading edge and fades out
    // 3.2 - 3.8s: "PHOTOGRAPHY" fades in with letter-spacing ease
    // 3.8 - 4.5s: hold briefly, then overlay fades to opacity 0 and unmounts
    const tFadeOut = setTimeout(() => {
      startFadeOut(650)
    }, 3850)
    timersRef.current.push(tFadeOut)

    return () => {
      clearAllTimers()
      document.body.style.overflow = originalOverflow
    }
  }, [clearAllTimers, startFadeOut])

  if (!shouldRender) return null

  return (
    <>
      {/* Inline early-check script to prevent flash on refresh in the same session */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{if(sessionStorage.getItem("intro-seen")==="true"){var el=document.getElementById("intro-loader");if(el){el.style.display="none";el.remove();}}}catch(e){}})();`,
        }}
      />

      <div
        id="intro-loader"
        className={isFadingOut ? "fade-out" : ""}
        onClick={handleSkip}
        role="button"
        tabIndex={0}
        aria-label="Skip introduction"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
            handleSkip()
          }
        }}
      >
        <div className="intro-content">
          <div className="signature-wrapper">
            <span className={`signature-word ${mrsSaintDelafield.className}`}>
              Pratham
            </span>
            <span className="pen-tip" aria-hidden="true" />
          </div>
          <span className="caption-word">
            PHOTOGRAPHY
          </span>
        </div>

        <style>{`
          html.intro-seen #intro-loader {
            display: none !important;
          }

          #intro-loader {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            background-color: #000000;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
            opacity: 1;
            transition: opacity 0.65s cubic-bezier(0.25, 1, 0.5, 1);
          }

          #intro-loader.fade-out {
            opacity: 0 !important;
            pointer-events: none !important;
          }

          .intro-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            pointer-events: none;
            padding: 0 1.5rem;
            max-width: 100vw;
            overflow: visible;
          }

          .signature-wrapper {
            position: relative;
            display: inline-block;
            line-height: 1.5;
            padding-top: 0.45em;
            padding-bottom: 0.45em;
            padding-left: 0.35em;
            padding-right: 0.35em;
            overflow: visible;
          }

          .signature-word {
            display: inline-block;
            font-size: clamp(5rem, 14vw, 10rem);
            color: #ffffff;
            white-space: nowrap;
            line-height: 1.5;
            letter-spacing: 0.01em;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
            overflow: visible;
            padding: 0.25em 0.1em;
            /* Smooth progressive handwriting mask - 160% height centered so tall flourishes never clip */
            -webkit-mask-image: linear-gradient(
              90deg,
              #000 0%,
              #000 45%,
              rgba(0, 0, 0, 0.45) 48%,
              transparent 50%,
              transparent 100%
            );
            mask-image: linear-gradient(
              90deg,
              #000 0%,
              #000 45%,
              rgba(0, 0, 0, 0.45) 48%,
              transparent 50%,
              transparent 100%
            );
            -webkit-mask-size: 240% 160%;
            mask-size: 240% 160%;
            -webkit-mask-position: 100% 50%;
            mask-position: 100% 50%;
            -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
            animation: writeSignature 2.8s cubic-bezier(0.42, 0, 0.22, 1) 0.4s forwards;
          }

          @keyframes writeSignature {
            0% {
              -webkit-mask-position: 100% 50%;
              mask-position: 100% 50%;
            }
            100% {
              -webkit-mask-position: 0% 50%;
              mask-position: 0% 50%;
            }
          }

          .pen-tip {
            position: absolute;
            top: 52%;
            left: 0;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background-color: ${TIP_COLOR};
            box-shadow:
              0 0 6px 1px ${TIP_COLOR},
              0 0 14px 2px ${TIP_COLOR},
              0 0 28px 4px rgba(124, 255, 196, 0.65),
              0 0 45px 8px rgba(124, 255, 196, 0.35);
            transform: translate(-50%, -50%);
            opacity: 0;
            pointer-events: none;
            animation:
              penFadeIn 0.4s ease-out 0s forwards,
              penTrack 2.8s cubic-bezier(0.42, 0, 0.22, 1) 0.4s forwards,
              penFadeOut 0.25s ease-out 3.2s forwards;
          }

          @keyframes penFadeIn {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.4);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }

          @keyframes penTrack {
            0% {
              left: 2%;
              top: 50%;
            }
            18% {
              left: 20%;
              top: 55%;
            }
            36% {
              left: 38%;
              top: 48%;
            }
            55% {
              left: 56%;
              top: 54%;
            }
            72% {
              left: 74%;
              top: 49%;
            }
            88% {
              left: 88%;
              top: 53%;
            }
            100% {
              left: 100%;
              top: 51%;
            }
          }

          @keyframes penFadeOut {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.3);
            }
          }

          .caption-word {
            display: block;
            font-family: var(--font-inter), sans-serif;
            text-transform: uppercase;
            font-size: clamp(0.7rem, 1.4vw, 0.8rem);
            color: #bbbbbb;
            text-align: center;
            margin-top: -0.25rem;
            letter-spacing: 0.7em;
            opacity: 0;
            animation: captionReveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 3.2s forwards;
          }

          @keyframes captionReveal {
            0% {
              opacity: 0;
              letter-spacing: 0.7em;
              transform: translateY(4px);
            }
            100% {
              opacity: 1;
              letter-spacing: 0.5em;
              transform: translateY(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .signature-word {
              -webkit-mask-image: none !important;
              mask-image: none !important;
              animation: none !important;
              opacity: 1 !important;
            }
            .pen-tip {
              display: none !important;
            }
            .caption-word {
              animation: none !important;
              opacity: 1 !important;
              letter-spacing: 0.5em !important;
              transform: none !important;
            }
            #intro-loader {
              transition: opacity 0.4s ease-out !important;
            }
          }
        `}</style>
      </div>
    </>
  )
}
