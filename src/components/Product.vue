<template>
    <div class="product-container">
        <a-modal v-model:open="productDialogVisible" :title="title" :footer="null" @close="closeDialog" width="1000px"
            centered>
            <div class="product-info">

                <a-segmented class="product-payment-cycle" v-model:value="current_payment_cycle"
                    :options="payment_cycles" :block="false" size="large"></a-segmented>

                <div class="product-list">
                    <div v-for="product in products" :index="product.product_name" :key="product.product_name">
                        <a-badge-ribbon :text="getDiscountText(product)" :color="'#9b1d1d'">

                            <div class="product-item">
                                <div class="title">{{ product.product_name }}</div>
                                <a-divider />

                                <div class="price-div">
                                    <div v-if="current_payment_cycle == '季付'">

                                        <div class="deleted-price">¥{{ originPrice(product.price).toFixed(2) }}</div>
                                    </div>
                                    <div v-else-if="current_payment_cycle == '年付'">

                                        <div class="deleted-price">¥{{ originPrice(product.price).toFixed(2) }}</div>
                                    </div>
                                    <div class="price">¥{{ totalPrice(product).toFixed(2) }}</div>
                                </div>

                                <el-button class="purchase-button" type="success" size="large"
                                    v-if="product.product_name == 'GPT Mini'" @click="goToPayment(product)"
                                    disabled>限时免费中</el-button>
                                <el-button class="purchase-button" size="large" type="primary" color="#1b7f64"
                                    v-else-if="product.product_name == 'GPT Plus'"
                                    @click="goToPayment(product)">升级至Plus</el-button>
                                <el-button class="purchase-button" size="large" type="primary" color="#b8860b"
                                    v-else-if="product.product_name == 'GPT Pro'"
                                    @click="goToPayment(product)">升级至Pro</el-button>
                                <div class="description" v-html="md.render(product.description)"></div>

                            </div>
                        </a-badge-ribbon>

                    </div>

                </div>

                <a-divider />
                <div class="contact-info">如遇充值问题，可及时联系客服处理。若有企业定制需求请和商务沟通。</div>

            </div>
        </a-modal>
        <Payment v-model:code_url="code_url" v-model:open="isPaymentDialogVisible"
            v-model:purchase_request="purchaseRequest"></Payment>
    </div>
</template>


<script setup lang="ts">
import { getProducts, purchase } from '@/services/ApiPay';
import { PurchaseRequest } from '@/types/Pay';
import { Product } from '@/types/Product';
import hljs from 'highlight.js';
import Cookies from 'js-cookie';
import MarkdownIt from 'markdown-it';
import { computed, ref, reactive, watchEffect } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { ElMessage } from 'element-plus';

const props = defineProps({
    open: Boolean
});
const emit = defineEmits(['update:open']);

const title = ref('请选择您的套餐')
const payment_cycles = reactive(['月付', '季付', '年付']);
const current_payment_cycle = ref(payment_cycles[0]);
const quantity = ref(1);
const code_url = ref('');


const productDialogVisible = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
});
const isPaymentDialogVisible = ref(false);
const purchaseRequest = ref<PurchaseRequest>({
    order_id: '',
    user_id: Cookies.get('userId') as string,
    product_id: 0,
    product_name: '',
    product_quantity: quantity.value,
    payment_method: '微信支付',
    payment_cycle: current_payment_cycle.value,
    payment_amount: 0,
});
let products = ref<Product[]>([]);


watchEffect(async () => {
    if (props.open === true && products.value.length === 0) {
        products.value = await getProducts();
    }
});


function getDiscountText(data: any) {
    let discount = 1.0
    if (current_payment_cycle.value == '月付') {
        discount = data.discount_monthly;
    } else if (current_payment_cycle.value == '季付') {
        discount = data.discount_quarterly;
    } else if (current_payment_cycle.value == '年付') {
        discount = data.discount_yearly;
    }
    if (discount === 1.0) {
        return 'Hot';
    } else {
        discount *= 10;
    }
    return '限时' + discount.toString() + '折';
};

function totalPrice(data: any): number {
    let discount = 1.0
    if (current_payment_cycle.value == '月付') {
        quantity.value = 1;
        discount = data.discount_monthly;
    } else if (current_payment_cycle.value == '季付') {
        quantity.value = 3;
        discount = data.discount_quarterly;
    } else if (current_payment_cycle.value == '年付') {
        quantity.value = 12;
        discount = data.discount_yearly;
    }
    return quantity.value * data.price * discount;
};

const originPrice = (price: number) => {
    if (current_payment_cycle.value == '月付') {
        quantity.value = 1;
    } else if (current_payment_cycle.value == '季付') {
        quantity.value = 3;
    } else if (current_payment_cycle.value == '年付') {
        quantity.value = 12;
    }
    return quantity.value * price;
};

const md = new MarkdownIt({
    html: true,
    xhtmlOut: false,
    breaks: true,
    langPrefix: 'language-',
    linkify: true,
    typographer: true,
    quotes: '“”‘’',
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                const languageLabel = `<div class="code-header">${lang}</div>`;
                const highlightedCode = hljs.highlight(str, { language: lang }).value;
                const markdownText = `${languageLabel}<pre class="hljs"><code>${highlightedCode}</code></pre>`;
                return markdownText;
            } catch (__) { }
        }

        return '';
    }
});

function openDialog() {
    productDialogVisible.value = true
};
function closeDialog() {
    productDialogVisible.value = false
}

async function goToPayment(product: Product) {
    
    purchaseRequest.value.order_id = uuidv4().replace(/-/g, '');
    // console.log(`click purchase button..., uuid is ${purchaseRequest.value.order_id}`)
    purchaseRequest.value.product_id = product.id
    purchaseRequest.value.product_name = product.product_name
    purchaseRequest.value.product_quantity = quantity.value
    purchaseRequest.value.payment_method = '微信支付'
    purchaseRequest.value.payment_cycle = current_payment_cycle.value
    purchaseRequest.value.payment_amount = totalPrice(product)

    
    let responseData:any = (await purchase(purchaseRequest.value));
    code_url.value = responseData.code_url;
    // console.log(`code url: ${code_url.value}`)
    if (code_url.value) {
        closeDialog();
    } else {
        ElMessage.error('支付请求异常，请稍后再试');
    }
    isPaymentDialogVisible.value = true;
}


</script>



<style scoped>
.product-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.product-payment-cycle {
    display: flex;
    justify-content: center;
    height: 40px;
    margin-top: 10px;
    margin-bottom: 20px;
}

.product-list {
    display: flex;
    flex-direction: row;
    gap: 40px;
}

.product-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 16rem;
    height: 450px;
    padding: 20px;
    border-color: aliceblue;
    border-radius: 20px;
    box-shadow: 0 4px 10px gray;
    background-color: white;
    position: relative;
}

.title {
    font-size: 24px;
    font-weight: 500;
    color: black;
}

.price-div {
    display: flex;
    flex-direction: column;
    align-items: center;
}


.price {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 30px;
}

.deleted-price {
    display: flex;
    justify-content: center;
    font-size: 16px;
    font-weight: 400;
    text-decoration: line-through;
}

.purchase-button {
    size: large;
    margin-bottom: 20px;
    font-size: 16px;
    color: white;
}

.contact-info {
    font-size: 12px;
    font-weight: 200;
}

.discount-tip {
    height: 30px;
    width: 70px;
    background-color: rgb(155, 29, 29);
    color: white;
    padding: 2px;
    font-size: 12px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
}

.discount-text {
    display: inline-block;
    font-weight: 500;
}
</style>