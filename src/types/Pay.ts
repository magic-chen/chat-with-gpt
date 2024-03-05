export interface PurchaseRequest{
    order_id: string,
    user_id: string,
    product_id: number,
    product_name: string,
    product_quantity: number,
    payment_method: string,
    payment_cycle: string,
    payment_amount: number
}