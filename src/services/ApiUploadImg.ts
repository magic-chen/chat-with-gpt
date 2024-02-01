import user_axios from '@/services/http';


function uploadAvatar(file: string | Blob) {
    const formData = new FormData();
    formData.append('avatar', file);

    return user_axios.post('YOUR_UPLOAD_URL', formData);
}
