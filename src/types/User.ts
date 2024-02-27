export interface User {
	user_id: string;
	avatar: string;
    is_login: boolean;
    current_model_id: number;
    current_model_engine_id: number;
    user_service_level_id:number
    third_party_provider: string
    third_party_id: string
    protected_name: string
}