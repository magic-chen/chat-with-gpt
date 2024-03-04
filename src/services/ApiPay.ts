import { apiConfig } from "@/config";
import { PurchaseRequest } from "@/types/Pay";
import user_axios from "./http";
import { AxiosError } from "axios";
import { StringGradients } from "ant-design-vue/es/progress/props";
import Cookies from "js-cookie";
import { Product } from "@/types/Product";

export async function purchase(reqeust: PurchaseRequest) :Promise<any>{
    let code_url = ""
    try {
      const request = {
        method: 'post',
        url: `${apiConfig.purchase}`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: reqeust
      };
    
      const response = await user_axios(request);
        if(response.data.code === 200){
            return response.data.data
        }
    } catch (error) {
      console.log(error)
    }
    return code_url;
  }

  export async function getProducts(): Promise<Product[]> {
    let user_id = Cookies.get('userId');
    try {
      const response = await user_axios.get(`${apiConfig.products}`);
      return response.data.data.products;
    } catch (error) {
      console.error('Error get products:', error);
    }
    return []
  }