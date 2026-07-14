import React, { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  // Kelajakda production backend URL manzili shu yerga qo'yiladi
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Matn muvaffaqiyatli saqlandi!');
        setText('');
      } else {
        setMessage(`Xatolik: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('Serverga ulanishda xatolik yuz berdi.');
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Hello World!</h1>
      <p>Ruzmetov.uz uchun test ilovasi</p>
      
      <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Matn kiriting..."
          style={{ padding: '10px', width: '250px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Yuborish
        </button>
      </form>

      {message && <p style={{ fontWeight: 'bold', color: 'green' }}>{message}</p>}
    </div>
  );
}

export default App;