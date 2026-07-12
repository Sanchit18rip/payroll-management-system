import { useState, useEffect } from "react";

function Clients() {

  const [clients, setClients] = useState([]);

  const [companyName, setCompanyName] =
    useState("");

  const [contactPerson, setContactPerson] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [serviceFee, setServiceFee] =
    useState("");

  const fetchClients = () => {

    fetch(
      "https://payroll-management-system-owo2.onrender.com/api/clients"
    )
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(err => console.log(err));

  };

  useEffect(() => {

    fetchClients();

  }, []);
  const addClient = () => {

  if (
    !companyName ||
    !contactPerson ||
    !email ||
    !phone ||
    !serviceFee
  ) {

    alert(
      "Please fill all fields"
    );

    return;

  }

  fetch(
    "https://payroll-management-system-owo2.onrender.com/api/clients",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({

        company_name:
          companyName,

        contact_person:
          contactPerson,

        email,

        phone,

        service_fee_percent:
          serviceFee

      })

    }
  )

    .then(res => res.json())

    .then(() => {

      setCompanyName("");

      setContactPerson("");

      setEmail("");

      setPhone("");

      setServiceFee("");

      fetchClients();

    })

    .catch(err =>
      console.log(err)
    );

};

  return (

   <div
  style={{
    padding: "30px",
    maxWidth: "1400px",
    margin: "0 auto",
    minHeight: "100vh",
    background: "#0f172a"
  }}
>

  <>
  <h1
    style={{
      fontSize: "42px",
      fontWeight: "700",
      color: "#f8fafc",
      marginBottom: "8px"
    }}
  >
    Client Management
  </h1>

  <p
    style={{
      color: "#94a3b8",
      marginBottom: "30px"
    }}
  >
    Manage third-party payroll clients.
  </p>
</>

  <div
    style={{
  background: "#1e293b",
  padding: "28px",
  borderRadius: "20px",
  marginBottom: "30px",
  border: "1px solid #334155",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.35)"
}}
  >

    <input
  type="text"
  placeholder="Company Name"
  value={companyName}
  onChange={(e) =>
    setCompanyName(
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #475569",
    background: "#0f172a",
    color: "#f8fafc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "16px"
  }}
/>
    <input
  type="text"
  placeholder="Contact Person"
  value={contactPerson}
  onChange={(e) =>
    setContactPerson(e.target.value)
  }
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #475569",
    background: "#0f172a",
    color: "#f8fafc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "16px"
  }}
/>
    <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #475569",
    background: "#0f172a",
    color: "#f8fafc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "16px"
  }}
/>

    <input
  type="text"
  placeholder="Phone"
  value={phone}
  onChange={(e) =>
    setPhone(e.target.value)
  }
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #475569",
    background: "#0f172a",
    color: "#f8fafc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "16px"
  }}
/>
    <input
  type="number"
  placeholder="Service Fee %"
  value={serviceFee}
  onChange={(e) =>
    setServiceFee(e.target.value)
  }
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #475569",
    background: "#0f172a",
    color: "#f8fafc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "16px"
  }}
/>
    <button
  onClick={addClient}
  style={{
    padding: "14px 24px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow:
      "0 4px 20px rgba(37,99,235,0.3)"
  }}
>
  Add Client
</button>

  </div>
  <div
  style={{
  background: "#1e293b",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid #334155",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.35)"
}}
>

  <h2
  style={{
    color: "#f8fafc",
    marginTop: 0,
    marginBottom: "20px"
  }}
>
  Client Companies
</h2>
  <table
    style={{
  width: "100%",
  borderCollapse: "collapse",
  color: "#f8fafc"
}}
  >

    <thead>

      <tr
  style={{
    background: "#0f172a"
  }}
>

        <th
  style={{
    padding: "16px",
    color: "#cbd5e1",
    textAlign: "left",
    borderBottom:
      "1px solid #334155"
  }}
>ID</th>

        <th
  style={{
    padding: "16px",
    color: "#cbd5e1",
    textAlign: "left",
    borderBottom:
      "1px solid #334155"
  }}
>Company</th>

        <th
  style={{
    padding: "16px",
    color: "#cbd5e1",
    textAlign: "left",
    borderBottom:
      "1px solid #334155"
  }}
>Contact Person</th>

        <th
  style={{
    padding: "16px",
    color: "#cbd5e1",
    textAlign: "left",
    borderBottom:
      "1px solid #334155"
  }}
>Email</th>

        <th
  style={{
    padding: "16px",
    color: "#cbd5e1",
    textAlign: "left",
    borderBottom:
      "1px solid #334155"
  }}
>Phone</th>

        <th
  style={{
    padding: "16px",
    color: "#cbd5e1",
    textAlign: "left",
    borderBottom:
      "1px solid #334155"
  }}
>Service Fee</th>

      </tr>

    </thead>

    <tbody>

      {clients.map((client) => (

        <tr key={client.id}>

          <td
  style={{
    padding: "16px",
    borderBottom:
      "1px solid #334155"
  }}
>
  {client.id}
</td>

          <td
  style={{
    padding: "16px",
    borderBottom: "1px solid #334155"
  }}
>
  {client.company_name}
</td>

<td
  style={{
    padding: "16px",
    borderBottom: "1px solid #334155"
  }}
>
  {client.contact_person}
</td>

<td
  style={{
    padding: "16px",
    borderBottom: "1px solid #334155"
  }}
>
  {client.email}
</td>

<td
  style={{
    padding: "16px",
    borderBottom: "1px solid #334155"
  }}
>
  {client.phone}
</td>

          <td
  style={{
    padding: "16px",
    borderBottom:
      "1px solid #334155"
  }}
>
  <span
    style={{
      background: "#1d4ed8",
      color: "#ffffff",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: "600"
    }}
  >
    {client.service_fee_percent}%
  </span>
</td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

</div>

  );

}

export default Clients;