"use client";

import { useEffect, useRef, useState, FormEvent } from "react";

// Random emojis for Schrödinger's Textbox
const RANDOM_EMOJIS = ["💀", "🔥", "💩", "👻", "👽", "🤡", "💩", "😈", "👺", "🤮", "😱", "🆘"];

export default function Home() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [progress, setProgress] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [spinnerOffset, setSpinnerOffset] = useState({ x: 17, y: 17 });
  const [fakeCursors, setFakeCursors] = useState([
    { x: 0, y: 0, delay: 0 },
    { x: 0, y: 0, delay: 50 },
    { x: 0, y: 0, delay: 100 },
  ]);
  const [captchaSquares, setCaptchaSquares] = useState<boolean[]>(
    Array(9).fill(false)
  );
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [showSystemError, setShowSystemError] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [baseFontSize, setBaseFontSize] = useState(16);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [pendingNameInput, setPendingNameInput] = useState("");
  const [buttonVisible, setButtonVisible] = useState(true);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [captchaStates, setCaptchaStates] = useState<{ clicked: boolean; fled: boolean }[]>(
    Array(9).fill({ clicked: false, fled: false })
  );

  // Anti-Exit Deterrent
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Warning: Your prize is 99% calculated. Leaving now will donate your winnings to the 'Society of People Who Build Terrible Websites'. Are you sure?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Anti-Responsive - fonts get smaller as window gets larger
  useEffect(() => {
    const handleResize = () => {
      const newSize = Math.max(8, 24 - (window.innerWidth / 50));
      setBaseFontSize(newSize);
      document.documentElement.style.setProperty("--base-font-size", `${newSize}px`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // High-Frequency Ghost Audio - 15kHz beep, 1s on/3s off
  useEffect(() => {
    if (!audioStarted) return;

    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Main torture oscillator (existing 1kHz)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    oscillator.start();

    // Ghost audio - 15kHz high frequency
    const ghostOscillator = audioContext.createOscillator();
    const ghostGain = audioContext.createGain();
    ghostOscillator.connect(ghostGain);
    ghostGain.connect(audioContext.destination);
    ghostOscillator.type = "sine";
    ghostOscillator.frequency.setValueAtTime(15000, audioContext.currentTime);
    ghostGain.gain.setValueAtTime(0.08, audioContext.currentTime);

    // Pulse: 1 second on, 3 seconds off
    const pulseGhost = () => {
      ghostOscillator.start();
      ghostGain.gain.setValueAtTime(0.08, audioContext.currentTime);
      setTimeout(() => {
        ghostGain.gain.setValueAtTime(0, audioContext.currentTime);
      }, 1000);
    };

    pulseGhost();
    const pulseInterval = setInterval(pulseGhost, 4000);

    // Warbling effect on main oscillator
    const interval = setInterval(() => {
      const randomFreq = 950 + Math.random() * 100;
      oscillator.frequency.setValueAtTime(randomFreq, audioContext.currentTime);
    }, 2000);

    return () => {
      oscillator.stop();
      ghostOscillator.stop();
      clearInterval(interval);
      clearInterval(pulseInterval);
      audioContext.close();
    };
  }, [audioStarted]);

  // Fake System Error Loop - every 30 seconds
  useEffect(() => {
    if (!audioStarted) return;

    const errorInterval = setInterval(() => {
      setShowSystemError(true);
    }, 30000);

    return () => clearInterval(errorInterval);
  }, [audioStarted]);

  // Handle system error buttons
  const handleFixNow = () => {
    for (let i = 0; i < 10; i++) {
      window.open("about:blank", "_blank");
    }
    setShowSystemError(false);
  };

  const handleIgnore = () => {
    setShowSystemError(false);
    const rotateInterval = setInterval(() => {
      setRotation((prev) => {
        if (prev >= 90) {
          clearInterval(rotateInterval);
          return 90;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Gaslighting Mouse Cursor - offset spinner
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      const offsetX = 17 + (Math.random() * 5 - 2.5);
      const offsetY = 17 + (Math.random() * 5 - 2.5);
      setSpinnerOffset({ x: offsetX, y: offsetY });

      setFakeCursors((prev) =>
        prev.map((cursor, i) => ({
          ...cursor,
          x: e.clientX + Math.sin(Date.now() / (200 + i * 100)) * (20 + i * 15),
          y: e.clientY + Math.cos(Date.now() / (200 + i * 100)) * (20 + i * 15),
        }))
      );
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fake progress bar that goes backwards after 99%
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          return Math.max(0, prev - 0.0167);
        }
        if (prev < 99) {
          return Math.min(99, prev + 0.825);
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Inverted scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy(0, -e.deltaY);
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel);
  }, []);

  // Shy button that runs away AND becomes invisible when cursor gets too close
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    setButtonPosition({ x: rect.left, y: rect.top });

    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const buttonCenter = {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      };

      const distance = Math.sqrt(
        Math.pow(e.clientX - buttonCenter.x, 2) +
          Math.pow(e.clientY - buttonCenter.y, 2)
      );

      // If cursor is within 100px, make button invisible
      if (distance < 100) {
        setButtonVisible(false);
        
        // Teleport to random position after short delay
        setTimeout(() => {
          const newX = Math.random() * (window.innerWidth - 250);
          const newY = Math.random() * (window.innerHeight - 80);
          
          if (buttonRef.current) {
            buttonRef.current.style.position = "fixed";
            buttonRef.current.style.left = `${Math.max(0, newX)}px`;
            buttonRef.current.style.top = `${Math.max(0, newY)}px`;
            buttonRef.current.style.opacity = "1";
          }
          setButtonPosition({ x: newX, y: newY });
          setTimeout(() => setButtonVisible(true), 300);
        }, 150);
      } else if (distance < 150) {
        // Original flee behavior for medium distance
        const angle = Math.atan2(
          buttonCenter.y - e.clientY,
          buttonCenter.x - e.clientX
        );
        const moveX = Math.cos(angle) * 50;
        const moveY = Math.sin(angle) * 50;

        const newX = buttonRect.left + moveX;
        const newY = buttonRect.top + moveY;

        buttonRef.current.style.position = "fixed";
        buttonRef.current.style.left = `${Math.max(0, Math.min(window.innerWidth - 250, newX))}px`;
        buttonRef.current.style.top = `${Math.max(0, Math.min(window.innerHeight - 80, newY))}px`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Navigation nightmare
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open("", "_blank");
    setTimeout(() => {
      window.location.href = "/404";
    }, 100);
  };

  const startAudio = () => {
    setAudioStarted(true);
    setShowCaptcha(true);
  };

  const handleCaptchaClick = (index: number) => {
    // Make the square show "Nope" and flee away
    setCaptchaStates((prev) => {
      const newStates = [...prev];
      newStates[index] = { clicked: true, fled: true };
      return newStates;
    });
    
    // Force page reload after short delay to reset the torment
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Schrödinger's Textbox - swap every 3rd character + 2 second artificial lag
  const handleNameChange = (e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    
    // Store the pending input
    setPendingNameInput(value);
    
    // Clear any existing timeout
    if ((window as unknown as { nameTimeout?: NodeJS.Timeout }).nameTimeout) {
      clearTimeout((window as unknown as { nameTimeout: NodeJS.Timeout }).nameTimeout);
    }
    
    // Set 2 second delay before showing typed characters
    (window as unknown as { nameTimeout: NodeJS.Timeout }).nameTimeout = setTimeout(() => {
      let processed = "";
      for (let i = 0; i < value.length; i++) {
        if ((i + 1) % 3 === 0) {
          if (Math.random() > 0.5) {
            processed += RANDOM_EMOJIS[Math.floor(Math.random() * RANDOM_EMOJIS.length)];
          } else {
            continue;
          }
        } else {
          processed += value[i];
        }
      }
      setNameValue(processed);
      setPendingNameInput("");
    }, 2000);
  };

  const handleEmailChange = (e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    let processed = "";
    for (let i = 0; i < value.length; i++) {
      if ((i + 1) % 3 === 0) {
        if (Math.random() > 0.5) {
          processed += RANDOM_EMOJIS[Math.floor(Math.random() * RANDOM_EMOJIS.length)];
        } else {
          continue;
        }
      } else {
        processed += value[i];
      }
    }
    setEmailValue(processed);
  };

  return (
    <>
      {/* Custom cursors & animations */}
      <style jsx global>{`
        :root {
          --base-font-size: 16px;
        }
        * {
          cursor: none !important;
        }
        .custom-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          font-size: 24px;
        }
        .cursor-1 {
          transition: all 0.05s ease-out;
        }
        .cursor-2 {
          transition: all 0.08s ease-out;
        }
        .cursor-3 {
          transition: all 0.12s ease-out;
        }
        .spinner-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 10000;
          width: 30px;
          height: 30px;
          border: 3px solid #00FF00;
          border-top: 3px solid transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        body {
          font-size: var(--base-font-size);
        }
      `}</style>

      {/* Gaslighting Offset Spinner Cursor */}
      <div
        className="spinner-cursor"
        style={{
          left: cursorPosition.x + spinnerOffset.x,
          top: cursorPosition.y + spinnerOffset.y,
        }}
      />

      {/* Multiple fake cursors */}
      <div
        className="custom-cursor cursor-1"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          color: "#FF00FF",
        }}
      >
        ✦
      </div>
      <div
        className="custom-cursor cursor-2"
        style={{
          left: fakeCursors[0].x,
          top: fakeCursors[0].y,
          color: "#00FF00",
        }}
      >
        ⬡
      </div>
      <div
        className="custom-cursor cursor-3"
        style={{
          left: fakeCursors[1].x,
          top: fakeCursors[1].y,
          color: "#FFFF00",
        }}
      >
        ◇
      </div>

      {/* Fake System Error Modal */}
      {showSystemError && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 20000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a2e",
              border: "3px solid #e74c3c",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "450px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            <div
              style={{
                backgroundColor: "#e74c3c",
                padding: "10px 15px",
                borderRadius: "5px 5px 0 0",
                margin: "-30px -30px 20px -30px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>
                System Error
              </span>
            </div>
            <p style={{ color: "#ecf0f1", marginBottom: "20px", lineHeight: 1.6 }}>
              A critical system error has been detected. Your computer may be at risk.
              Error code: 0xDEADBEEF
            </p>
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button
                onClick={handleFixNow}
                style={{
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "12px 25px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Fix Now
              </button>
              <button
                onClick={handleIgnore}
                style={{
                  backgroundColor: "#7f8c8d",
                  color: "white",
                  border: "none",
                  padding: "12px 25px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 90s tiled background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          backgroundColor: "#000",
          backgroundImage: `
            url("https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"),
            url("https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif"),
            url("https://media.giphy.com/media/l378giAZgxPw3eO52/giphy.gif")
          `,
          backgroundSize: "150px 150px",
          backgroundRepeat: "repeat",
          opacity: 0.3,
        }}
      />

      <div
        style={{
          minHeight: "200vh",
          padding: "20px",
          position: "relative",
          transform: `rotate(${rotation}deg)`,
          transition: "transform 1s ease-in-out",
        }}
      >
        {/* Chaotic overlapping elements */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "5px",
            backgroundColor: "#00FF00",
            color: "#FF00FF",
            padding: "30px",
            fontSize: "48px",
            fontFamily: "Impact, sans-serif",
            transform: "rotate(-5deg)",
            zIndex: 1,
            border: "5px solid #FF0000",
          }}
        >
          CONGRATULATIONS!!!
        </div>

        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "-20px",
            backgroundColor: "#FF00FF",
            color: "#00FF00",
            padding: "20px",
            fontSize: "32px",
            fontFamily: "Comic Sans MS, cursive",
            transform: "rotate(3deg)",
            zIndex: 2,
            border: "3px dashed #FFFF00",
          }}
        >
          YOU ARE THE 1,000,000th VISITOR!
        </div>

        <div
          style={{
            position: "absolute",
            top: "200px",
            left: "30px",
            backgroundColor: "#FFFF00",
            color: "#FF00FF",
            padding: "15px",
            fontSize: "24px",
            fontWeight: "bold",
            transform: "rotate(-2deg)",
            zIndex: 3,
          }}
        >
          ★★★ $1,000,000 CLAIM ★★★
        </div>

        {/* Main content area */}
        <div
          style={{
            marginTop: "350px",
            position: "relative",
            zIndex: 10,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "40px",
            border: "10px solid #FF00FF",
            borderRadius: 0,
          }}
        >
          <h1
            style={{
              color: "#00FF00",
              fontSize: "64px",
              textAlign: "center",
              textShadow: "3px 3px #FF00FF",
              marginBottom: "20px",
              fontFamily: "Papyrus, fantasy",
            }}
          >
            🎉 CLAIM YOUR PRIZE! 🎉
          </h1>

          <p
            style={{
              color: "#FFFF00",
              fontSize: "28px",
              textAlign: "center",
              marginBottom: "30px",
              backgroundColor: "#FF00FF",
              padding: "10px",
            }}
          >
            You have been selected to receive a FABULOUS PRIZE!
          </p>

          {/* Fake loading bar */}
          <div
            style={{
              width: "100%",
              height: "40px",
              backgroundColor: "#333",
              border: "3px solid #00FF00",
              marginBottom: "30px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: progress < 99 ? "#00FF00" : "#FF0000",
                transition: "width 0.1s linear",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#FFF",
                fontSize: "20px",
                fontWeight: "bold",
                textShadow: "2px 2px #000",
              }}
            >
              LOADING PRIZE: {progress.toFixed(1)}%
            </span>
          </div>

          {/* Schrödinger's Textbox - Name and Email inputs */}
          <div style={{ marginBottom: "30px" }}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  color: "#00FF00",
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "18px",
                }}
              >
                Your Name:
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={nameValue}
                onChange={handleNameChange}
                placeholder="Try to type your name..."
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "20px",
                  backgroundColor: "#222",
                  border: "3px solid #FF00FF",
                  color: "#00FF00",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  color: "#00FF00",
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "18px",
                }}
              >
                Email Address:
              </label>
              <input
                ref={emailInputRef}
                type="text"
                value={emailValue}
                onChange={handleEmailChange}
                placeholder="Try to type your email..."
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "20px",
                  backgroundColor: "#222",
                  border: "3px solid #FF00FF",
                  color: "#00FF00",
                }}
              />
            </div>
          </div>

          {/* The Shy Button - Now INVISIBLE when you get close! */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <button
              ref={buttonRef}
              onClick={startAudio}
              style={{
                backgroundColor: "#FF00FF",
                color: "#00FF00",
                border: "5px solid #FFFF00",
                padding: "20px 50px",
                fontSize: "36px",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "Impact, sans-serif",
                boxShadow: "10px 10px 0px #FF0000",
                transition: "opacity 0.15s, transform 0.1s",
                opacity: buttonVisible ? 1 : 0,
                pointerEvents: buttonVisible ? "auto" : "none",
              }}
            >
              🔥 CLAIM PRIZE NOW! 🔥
            </button>
          </div>

          {/* Hidden emotional CAPTCHA */}
          {showCaptcha && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.95)",
                zIndex: 10000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h2
                style={{
                  color: "#888",
                  fontSize: "36px",
                  marginBottom: "30px",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                CAPTCHA: Click all squares that contain Hope
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 150px)",
                  gap: "10px",
                }}
              >
                {captchaSquares.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleCaptchaClick(index)}
                    style={{
                      width: "150px",
                      height: "150px",
                      backgroundColor: captchaStates[index]?.clicked ? "#FF0000" : "#666",
                      border: "2px solid #888",
                      cursor: "pointer",
                      transform: captchaStates[index]?.fled ? "translate(200px, 0) rotate(20deg)" : "none",
                      transition: "transform 0.3s ease-out, background-color 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: captchaStates[index]?.clicked ? "#FFF" : "transparent",
                    }}
                  >
                    {captchaStates[index]?.clicked ? "Nope" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* More chaotic decorations */}
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              left: "-50px",
              backgroundColor: "#FF0000",
              color: "#00FF00",
              padding: "40px",
              fontSize: "36px",
              fontFamily: "Impact, sans-serif",
              transform: "rotate(7deg)",
              zIndex: 4,
              border: "8px dashed #FFFF00",
            }}
          >
            ★★★ WINNER ★★★
          </div>
        </div>
      </div>
    </>
  );
}
