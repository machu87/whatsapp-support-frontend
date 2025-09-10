import { useEffect, useState } from 'react'
import { Layout, List, Typography, Input, Button, Space } from 'antd'
import dayjs from 'dayjs'
import { listConversations, getMessages, sendMessage } from './api'

const { Sider, Content } = Layout
const { Title, Text } = Typography

type Conversation = { _id: string; participant: string; status: 'open'|'closed'; createdAt: string; updatedAt: string }
type Message = { conversationId: string; direction:'inbound'|'outbound'; from:string; to:string; body?:string; createdAt:string }

export default function App(){
  const [convs, setConvs] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')

  async function refreshConversations(){
    const data = await listConversations()
    setConvs(data)
    if(!selected && data.length){
      onSelect(data[0])
    }
  }

  async function onSelect(c: Conversation){
    setSelected(c)
    const data = await getMessages(c._id)
    setMessages(data)
  }

  async function onSend(){
    if(!selected || !text.trim()) return
    await sendMessage(selected.participant, text.trim())
    setText('')
    // Refresh
    const data = await getMessages(selected._id)
    setMessages(data)
  }

  useEffect(()=>{ refreshConversations() }, [])

  return (
    <Layout style={{minHeight:'100vh'}}>
      <Sider width={320} style={{background:'#fff', borderRight:'1px solid #eee', padding:16}}>
        <Title level={4} style={{marginTop:0}}>Conversaciones</Title>
        <List
          dataSource={convs}
          renderItem={(c)=> (
            <List.Item onClick={()=>onSelect(c)} style={{cursor:'pointer', background: selected?._id===c._id ? '#f5f5f5':'transparent', borderRadius:8, padding:8}}>
              <Space direction="vertical" size={2}>
                <Text strong>{c.participant}</Text>
                <Text type="secondary" style={{fontSize:12}}>{dayjs(c.updatedAt).format('DD MMM HH:mm')}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Sider>
      <Content style={{padding:24}}>
        {selected ? (
          <div style={{maxWidth:800, margin:'0 auto', display:'grid', gap:16}}>
            <Title level={4} style={{marginTop:0}}>{selected.participant}</Title>
            <div style={{border:'1px solid #eee', borderRadius:12, padding:16, height:'60vh', overflow:'auto', display:'grid', gap:8}}>
              {messages.map((m,i)=> (
                <div key={i} style={{display:'flex', justifyContent: m.direction==='outbound'?'flex-end':'flex-start'}}>
                  <div style={{maxWidth:'70%', background: m.direction==='outbound'?'#e6f7ff':'#fafafa', border:'1px solid #eee', borderRadius:12, padding:'8px 12px'}}>
                    <div style={{fontSize:13, whiteSpace:'pre-wrap'}}>{m.body}</div>
                    <div style={{fontSize:11, opacity:.6, marginTop:4}}>{dayjs(m.createdAt).format('DD MMM HH:mm')}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:'flex', gap:8}}>
              <Input.TextArea value={text} onChange={e=>setText(e.target.value)} rows={2} placeholder="Escribe un mensaje..." />
              <Button type="primary" onClick={onSend}>Enviar</Button>
            </div>
          </div>
        ) : (
          <div>Selecciona una conversación</div>
        )}
      </Content>
    </Layout>
  )
}
