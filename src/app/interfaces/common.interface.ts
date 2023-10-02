export interface ApiResponse {
    api_response: string,
    message: string,
    status_code: string
}

export interface UserDetails {
    role: string,
    name: string,
    email: string,
    permissions: string[],
    logoImage: string,
    lead_email: string,
    email_configurations: number,
    twilio_configurations: number,
    date_format: string,
    time_zone: string,
    reports_decription: any,
    user_id: string,
    color: string,
    company_type: string,
    agent_logout_session: string,
    manage_card_permission: Array<any>
}

