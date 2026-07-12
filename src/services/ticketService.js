import { supabase } from '../supabaseClient'

export async function getAllTickets(filter) {

  let query = supabase
    .from('tickets')
    .select('*, employees(full_name:name, department, employee_code)')
    .order('created_at', { ascending: false })

  if (filter && filter !== 'All') {
    query = query.eq('status', filter)
  }

  const { data, error } = await query

  if (error) {
    console.log(error)
    return []
  }

  return data

}

export async function updateTicket(id, updates) {

  const { data, error } = await supabase
    .from('tickets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.log(error)
    throw error
  }

  return data

}

export async function createTicket({ employee_id, subject, description }) {
   console.log('createTicket called with:', employee_id, subject, description)   

   const { data, error } = await supabase
    .from('tickets')
    .insert([{ employee_id, subject, description, status: 'Open' }])
    .select()
    .single()

  if (error) {
    console.log(error)
    throw error
  }

  return data

}

export async function getEmployeeChatHistory(employeeId) {

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: true })

  if (error) {
    console.log(error)
    return []
  }

  return data

}

export async function addChatMessage({ employee_id, sender, message }) {

  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{ employee_id, sender, message }])
    .select()
    .single()

  if (error) {
    console.log(error)
    throw error
  }

  return data

}

export function subscribeToNewTickets(callback) {

  const channel = supabase
    .channel('tickets-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tickets' },
      (payload) => callback(payload.new)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }

}
