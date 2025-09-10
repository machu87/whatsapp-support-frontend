export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function listConversations(){
  const r = await fetch(`${API}/conversations`);
  return r.json();
}

export async function getMessages(id: string){
  const r = await fetch(`${API}/conversations/${id}/messages`);
  return r.json();
}

export async function sendMessage(to: string, body: string){
  const r = await fetch(`${API}/messages/send`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ to, body })
  });
  return r.json();
}
