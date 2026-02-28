"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed as PWA — hide everything
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    if (sessionStorage.getItem(DISMISSED_KEY)) {
      setDismissed(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const isIOS = useIsIOS();

  const handleInstallClick = useCallback(async () => {
    // Android / Chrome — native prompt available
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    // iOS — show manual instructions
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // Fallback for other browsers — show generic instructions
    setShowIOSGuide(true);
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  }, []);

  const isMobile = useIsMobile();

  // Hide on desktop, if already installed, or if dismissed
  if (!isMobile || installed || dismissed) return null;

  return (
    <>
      {/* Fixed bottom banner */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "#FF6B00",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          fontFamily: "sans-serif",
          fontSize: 14,
          boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <span style={{ flex: 1, lineHeight: 1.4 }}>
          📲 हे अॅप फोनवर इन्स्टॉल करा!
        </span>
        <button
          onClick={handleInstallClick}
          style={{
            backgroundColor: "#fff",
            color: "#FF6B00",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          इन्स्टॉल करा
        </button>
        <button
          onClick={handleDismiss}
          aria-label="बंद करा"
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            padding: "0 2px",
            lineHeight: 1,
            opacity: 0.8,
          }}
        >
          ✕
        </button>
      </div>

      {/* iOS / fallback instructions modal */}
      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px 16px 0 0",
              padding: "24px 20px 32px",
              maxWidth: 400,
              width: "100%",
              fontFamily: "sans-serif",
            }}
          >
            <h3
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#1a1a1a",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              होम स्क्रीनवर जोडा
            </h3>

            {isIOS ? (
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.8 }}>
                <p style={{ marginBottom: 12 }}>
                  <strong>1.</strong> खाली दिसणाऱ्या{" "}
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "#f3f4f6",
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 16,
                    }}
                  >
                    ⬆️ Share
                  </span>{" "}
                  बटणावर क्लिक करा
                </p>
                <p style={{ marginBottom: 12 }}>
                  <strong>2.</strong> खाली स्क्रोल करा आणि{" "}
                  <strong>&quot;Add to Home Screen&quot;</strong> निवडा
                </p>
                <p>
                  <strong>3.</strong> <strong>&quot;Add&quot;</strong> वर क्लिक करा
                </p>
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.8 }}>
                <p style={{ marginBottom: 12 }}>
                  <strong>1.</strong> ब्राउझरच्या मेनूवर{" "}
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "#f3f4f6",
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 16,
                    }}
                  >
                    ⋮
                  </span>{" "}
                  क्लिक करा
                </p>
                <p style={{ marginBottom: 12 }}>
                  <strong>2.</strong>{" "}
                  <strong>&quot;Add to Home screen&quot;</strong> किंवा{" "}
                  <strong>&quot;Install app&quot;</strong> निवडा
                </p>
                <p>
                  <strong>3.</strong> <strong>&quot;Install&quot;</strong> वर क्लिक करा
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowIOSGuide(false);
                handleDismiss();
              }}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "12px 0",
                backgroundColor: "#FF6B00",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              समजले
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setMobile(/Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua));
  }, []);
  return mobile;
}

function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  }, []);
  return isIOS;
}
