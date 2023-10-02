import { environment } from '../../environments/environment';
export const CONFIGURATIONS = {
    DEV: {
        TOKEN_KEY: 'dG9rZW4',
        USER_CREDENTIALS: 'DcmVkZW',
        ENC_KEY: 'WFsQ1JN',
        USER_DETAILS: 'RldGFpbHM',
        ALLOWED_FILES: ['image/png', 'image/jpeg', 'image/gif', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'audio/mpeg', 'audio/x-wav'],
        ALLOWED_CSV_FILES: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xls', 'xlsx']
    },

    LIVE: {
        TOKEN_KEY: 'dG9rZW4',
        USER_CREDENTIALS: 'DcmVkZW',
        ENC_KEY: 'WFsQ1JN',
        USER_DETAILS: 'RldGFpbHM',
        ALLOWED_FILES: ['image/png', 'image/jpeg', 'image/gif', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'audio/mpeg', 'audio/x-wav'],
        ALLOWED_CSV_FILES: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xls', 'xlsx']

    }
}

export const Roles = {
    ADMINISTRATOR: 'Administrator',
    COMPANY: 'Company',
    SUBMITTER: 'Submitter',
    UNDERWRITER: 'Underwriter',
    BRANCHMANAGER: 'Branchmanager',
    CUSTOMER: 'Customer'
}

export const Mask = {
    phone: '(000) 000-0000',
    ssn: '000-00-0000',
    federal_tax_id: '00-0000000',
    ten_digit: '0000000000'
}

export const Custom_Regex = {
    email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    spaces: /(?!^ +$)^.+$/,
    username: /^([a-zA-Z0-9-_])/,
    EMAIL_REGEX_COMMA_SEPRATED: /^(([^<>()\[\]\\.,;:\s@]+(\.[^<>()\[\]\\.,;:\s@]+)*)|(.+))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    name:/^(?=.*[a-zA-Z])/,
    // username:/^[a-zA-Z0-9_ ]+$/
    password: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    digitsOnly: /^\d+$/,
    website: /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/,
  // website: /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi,
//   ^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2}$
// amount:/^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2}$/,
    amount: /^\d*(\.\d+)?$/,
    lettersOnly: /^[a-zA-Z_ ]+$/,
    date: /^\d{1,2}\-\d{1,2}\-\d{4}$/,
    address: /^([a-zA-Z0-9., -_/#=$()&])/,
    address2:/^(?=.*[a-zA-Z0-9])/,
    city: /^([a-zA-Z0-9])/,
    // /[a-zA-Z]+/,
}

export const SETTINGS = environment.production ? CONFIGURATIONS['LIVE']: CONFIGURATIONS['DEV'];