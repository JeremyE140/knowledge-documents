import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./User.css";

const SYSTEM_MESSAGE = {
  id: 0,
  type: "system",
  content: "Bonjour, je suis Ensight, je suis prêt à répondre à vos demandes !",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

function getYoutubeEmbedUrl(url) {
  if (!url) return "";

  try {
    // Cas youtu.be/VIDEO_ID
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Cas youtube.com/watch?v=VIDEO_ID
    if (url.includes("youtube.com")) {
      const parsedUrl = new URL(url);
      const videoId = parsedUrl.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return "";
  } catch {
    return "";
  }
}

export default function User() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([SYSTEM_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('user-page-active');
    return () => {
      document.body.classList.remove('user-page-active');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  useEffect(() => {
  if (!isLoading) {
    textareaRef.current?.focus();
  }
}, [isLoading]);


  const openPDF = (pdfPath) => window.open(pdfPath, '_blank');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const baseUrl = import.meta.env.VITE_BACKEND_API_URL;
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const keywords = currentInput.toLowerCase().split(/\s+/);
      const params = new URLSearchParams({ keywords });
      const searchUrl = `${baseUrl}/api/documents/search?${params.toString()}`;

      const response = await fetch(searchUrl);
      
      if (!response.ok) throw new Error("Erreur serveur");
      const results = await response.json();
      
      const answer = results?.answer ?? "";
      const foundDocs = Array.isArray(results?.foundDocs) ? results.foundDocs : [];

      const pdfs = foundDocs.filter(d => d.type === "pdf");
      const images = foundDocs.filter(d => d.type === "image");
      const videos = foundDocs.filter(d => d.type === "youtube");
      let responseContent = answer ? (
        <div className="ai-response">
          {answer && (
            <div className="answer-block">
              { <pre className="answer-text">{answer}</pre> }
            </div>
          )}
          {videos.length > 0 && (
            <>
              <br/>
              <h3>Vidéo{videos.length > 1 ? "s" : ""}</h3>
              {videos.map((vid) =>
                vid.type === "youtube" ? (
                  <iframe
                    key={vid.path}
                    src={getYoutubeEmbedUrl(vid.path)}
                    title={vid.name}
                    width="100%"
                    height="315"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : null
              )}
            </>
          )}
          {images.length > 0 && (
            <>
              <br/>
              <h3>Image{images.length > 1 ? "s" : ""}</h3>
              <div className="image-grid">
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={`${baseUrl}${img.path}`}
                    alt={img.name}
                    className="result-image"
                  />
                ))}
              </div>
            </>
          )}
          {pdfs.length > 0 && (
            <>
              <br/>
              <h3>Document{pdfs.length > 1 ? "s" : ""} PDF</h3>
              <div className="doc-grid">
                {pdfs.map((doc) => (
                  <div
                    key={doc.id}
                    className="doc-card"
                    onClick={() => openPDF(`${baseUrl}${doc.path}`)}
                  >
                    <div className="doc-card-icon">PDF</div>
                    <div className="doc-card-info">
                      <span className="doc-card-name">
                        {doc.name.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        "Aucun document trouvé pour cette recherche. Essayez de reformuler."
      );

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: "system",
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: "system",
        content: "Erreur de connexion au serveur.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="app-layout">
      <header className="top-nav">
        <div className="nav-logo">
          <Link to="/">
            <img src="/ensight.png" alt="Logo" className="logo-image"/>
          </Link>
          Ensight
        </div>
        <button className="reset-btn" onClick={() => setMessages([SYSTEM_MESSAGE])}>
          + Nouveau chat
        </button>
      </header>

      <main className="chat-container">
        <div className="messages-viewport">
          {messages.map((message) => (
            <div key={message.id} className={`message-row ${message.type}`}>
              <div className="message-wrapper">
                {message.type === "user" ? 
                <img src="/user.png" alt="Logo" className="logo-image"/> :
                <img src="/ensight.png" alt="Logo" className="logo-image"/>
                }
                <div className="message-body">
                  <div className="content">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-row system">
              <div className="message-wrapper">
                <img src="/ensight.png" alt="Logo" className="logo-image"/>
                <div className="typing-indicator"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container-inner">
            <textarea
              ref={textareaRef}
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question"
              disabled={isLoading}
            />
            <button
                type="submit"
                className="send-btn"
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                title="Rechercher"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
          </div>
        </div>
      </main>
    </div>
  );
}