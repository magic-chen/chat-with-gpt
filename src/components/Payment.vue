<template>
    <div>

        <a-modal v-model:open="dialogVisible" :title="title" :footer="null" @close="closeDialog" width="1000px" centered>

            
            <div class="pay-info">
                <div class="order-info">
                    <span>商品名称：{{props.purchase_request?.product_name}}</span>
                    <span>支付周期：{{props.purchase_request?.payment_cycle}}</span>
                    <span>有效时间：{{props.purchase_request?.product_quantity}}个月</span>
                </div>
                <div class="price-info">
                    <span>{{props.purchase_request?.payment_amount.toFixed(2)}}元</span>
                </div>
            </div>
            <div class="pay-tabs">
                <div class="pay-tab-pane">
                    <div class="wechat-pay-div" :class="{ active: activeTab === 'wechat' }" @click="activateTab('wechat')">
                        <img :src="wechatPayLogo" :style="{ width: '20px', height: '20px' , margin: '5px 10px'}"/>
                        <span style="margin-right: 5px;">微信支付</span>
                    </div>
                    <div class="ali-pay-div" :class="{ active: activeTab === 'ali' }" @click="activateTab('ali')">
                        
                            <AlipaySquareFilled :style="{fontSize:'20px', color: '#226bf3', margin: '5px'}"/>
                            <span style="margin-right: 5px;">支付宝支付</span>
                        
                    </div>
                </div>
                
                <a-divider></a-divider>
                <div class="qr-code-div">
                    <iframe v-if="showAlipayIframe" ref="alipayIframe" style="border: none;" width="220px" height="220px" :src="alipayResponseHtml"></iframe>
                    <a-qrcode v-else error-level="H" :size="220" :icon-size="50" :value="props.code_url"
                        :icon="wechatPayLogo"></a-qrcode>
                </div>
                <a-divider />
                <div class="contact-info">如遇充值问题，可及时联系客服处理。若有企业版部署和私有模型定制请和商务沟通。</div>

            </div>
            
        </a-modal>
        
    </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { PurchaseRequest } from '@/types/Pay';
import {AlipaySquareFilled} from '@ant-design/icons-vue';
import { purchase } from '@/services/ApiPay';


const props = defineProps({
    open: Boolean,
    code_url: String,
    purchase_request: {
        type: Object as () => PurchaseRequest,
        required: true 
    }
});
const emit = defineEmits(['update:open']);
const dialogVisible = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
});
const title = ref('请扫码完成支付')
const activeTab = ref('wechat');
const wechatPayLogo = 'http://139.224.200.166/avatars/wechat-pay.png';
const showAlipayIframe = ref(false);
const alipayResponseHtml = ref('');

function  closeDialog(){
    dialogVisible.value = false
}

function  activateTab(tab:string){
    activeTab.value = tab;

    if(tab === 'ali'){
        payToAli();
        showAlipayIframe.value = true;
    }else if(tab === 'wechat'){
        showAlipayIframe.value = false;
    }
}

async function payToAli(){
    props.purchase_request.payment_method = '支付宝支付'
    let responseData = await purchase(props.purchase_request) 
    alipayResponseHtml.value = responseData.data
}

</script>


<style scoped>


.pay-info {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    margin-bottom: 10px;
    height: 150px;
    width: 100%;
    background-color: var(--gray-100);
    border-radius: 10px;
}

.order-info {
    display: flex;
    flex-direction: column;
    justify-content: center;

    flex: 1;
    margin-left: 20px;
    gap: 10px;

    font-size: 14px;
    font-weight: 400;
}

.price-info {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    width: 20%;
    font-size: 24px;
    font-weight: 600;
    color: #FF6600;
}

.pay-tabs {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.pay-tab-pane {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    gap: 10px;
}

.wechat-pay-div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    max-width: 120px;
    height: 40px;
    border: 1px solid var(--gray-200); 
    border-radius: 8px;
    margin-top: 15px;
    margin-bottom: -24px;
    cursor: pointer;
}

.ali-pay-div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    max-width: 120px;
    height: 40px;
    border: 1px solid var(--gray-200); 
    border-radius: 8px;
    margin-top: 15px;
    margin-bottom: -24px;
    cursor: pointer;
}

.wechat-pay-div:hover {
    background-color: var(--gray-100);
}
.wechat-pay-div.active{
    background-color: var(--gray-100);
}

.ali-pay-div:hover {
    background-color: var(--gray-100);
}
.ali-pay-div.active {
    background-color: var(--gray-100);
}

.qr-code-div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 250px;
}

.contact-info {
    font-size: 12px;
    font-weight: 200;
}
</style>