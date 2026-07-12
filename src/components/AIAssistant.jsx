import { useState, useEffect, useRef } from "react";
import "./AIAssistant.css";
import hrKnowledgeBase from "../data/hrKnowledgeBase";

function AIAssistant() {

const [open, setOpen] = useState(false);
const [input, setInput] = useState("");
const [typing, setTyping] = useState(false);
const messagesEndRef = useRef(null);
const [messages, setMessages] = useState([
{
sender:"ai",
text:"👋 Hello HR! How can I help you today?"
}
]);
const sendMessage = (customText = null) => {

const message = customText || input;

if (!message.trim()) return;

const userMessage = {
sender: "user",
text: message
};

setMessages(prev => [...prev, userMessage]);

const query = message.toLowerCase();

const match = hrKnowledgeBase.find(item =>
item.keywords.some(keyword =>
query.includes(keyword.toLowerCase()))
);

setTyping(true);

setTimeout(() => {

setTyping(false);

if (match) {

setMessages(prev => [
...prev,
{
sender: "ai",
text: match.answer
}
]);

} else {

setMessages(prev => [
...prev,
{
sender: "ai",
text:
`❌ I couldn't find an answer.

Connect to HR Support

📞 +91 98765 XXXXX

✉ hr@company.com`
}
]);

}

}, 800);

if (!customText) {
setInput("");
}

};
const sendQuickQuestion = (query) => {

sendMessage(query);

};
useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
        behavior: "smooth"
    });

}, [messages, typing]);

const quickActions = [

{
icon:"➕",
label:"Add Employee",
query:"How do I add a new employee?"
},

{
icon:"💰",
label:"Generate Payroll",
query:"How do I generate payroll?"
},

{
icon:"📅",
label:"Mark Attendance",
query:"How do I mark employee attendance?"
},

{
icon:"🏖",
label:"Approve Leave",
query:"How do I approve or reject leave requests?"
},

{
icon:"📊",
label:"Reports",
query:"How do I generate payroll reports?"
},

{
icon:"🏢",
label:"Company Policies",
query:"How do I update company policies?"
}

];
return (

<>

<div
className="ai-button"
onClick={() => setOpen(!open)}
>

🤖

</div>

{open && (

<div className="ai-window">

<div className="ai-header">

<div>

<h3>HR AI Assistant</h3>

<p>Always ready to help</p>

</div>

<button
onClick={() => setOpen(false)}
>

✕

</button>

</div>

<div className="ai-body">

{/* Quick Actions */}

{messages.length === 1 && (

<div className="quick-actions">

{quickActions.map((item,index)=>(

<button

key={index}

onClick={()=>sendQuickQuestion(item.query)}

>

<span>{item.icon}</span>

{item.label}

</button>

))}

</div>

)}

{/* Chat Messages */}

{messages.map((msg,index)=>(

<div
key={index}
className={
msg.sender==="ai"
?
"ai-message"
:
"user-message"
}
>

{msg.text}

</div>

))}

{/* Typing Animation */}

{typing && (

<div className="typing">

<div className="typing-bubble">

<span></span>

<span></span>

<span></span>

</div>

<p>HR AI is typing...</p>

</div>

)}

<div ref={messagesEndRef}></div>

</div>

<div className="ai-footer">

<input

type="text"

placeholder="Ask anything..."

value={input}

onChange={(e)=>setInput(e.target.value)}

onKeyDown={(e)=>{

if(e.key==="Enter"){

sendMessage();

}

}}

/>
<button
onClick={sendMessage}
>

➜

</button>

</div>

</div>

)}

</>

);

}

export default AIAssistant;