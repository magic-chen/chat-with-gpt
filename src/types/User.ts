export interface User {
	user_id: string;
	avatar: string;
    is_login: boolean;
    current_model_id: number;
    current_user_service_level:number
    third_party_provider: string
    third_party_id: string
}