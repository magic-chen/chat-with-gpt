
import { sendSms } from '@/services/ApiSendSms';
import CryptoJS from 'crypto-js';
import { ElMessage } from 'element-plus';
import Cookies from 'js-cookie';
import MarkdownIt from 'markdown-it'
import { ref } from 'vue';

const colors = [
	"#F2994A", // 活力橙色
	"#27AE60", // 清新绿色
	"#EB5757", // 柔和红色
];
const md = new MarkdownIt();
const timer = ref<NodeJS.Timeout | null>(null);

function getColorForTitle(title:string) {
  const hash = CryptoJS.SHA256(title).toString();
  const hashValue = parseInt(hash.substring(0, 8), 16);
  const colorIndex = hashValue % colors.length;
  return colors[colorIndex];
}

function scrollToBottom() {
  const chatContent= document.querySelector('.chat-content');
  if (chatContent) {
    chatContent.scrollTop = chatContent.scrollHeight;
  }
}

function renderMarkdown(text:string) {
  const htmlContent = md.render(text);
  return htmlContent;
}

function clearLoginData() {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('userId');
}

function generateRandomNumber(): number {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const mapTwoDigitsToLetter = (twoDigits: string): string => {
  const number = parseInt(twoDigits, 10);
  return String.fromCharCode(65 + number % 26);
};

function convertFourDigitsToTwoLetters(fourDigits: string): string {
  if (fourDigits.length !== 4 || isNaN(parseInt(fourDigits, 10))) {
    throw new Error("Input must be a four-digit number.");
  }

  // 分割四位数为两个两位数
  const firstPart = fourDigits.substring(0, 2);
  const secondPart = fourDigits.substring(2, 4);

  // 映射每部分到一个字母
  const firstLetter = mapTwoDigitsToLetter(firstPart);
  const secondLetter = mapTwoDigitsToLetter(secondPart);

  return firstLetter + secondLetter;
};

export async function getVerifyCode(event:any, phoneNumber:string, countdown:any){
  event.preventDefault();
  if (!phoneNumber) {
    ElMessage.error("手机号不能为空");
  }
  console.log("get verify code, countdown value is :", countdown.value)
  if (countdown.value === 0) {
      countdown.value = 120;
      try{
          let result = await sendSms(phoneNumber);
          if(!result){
              return "发送验证码出错, 请重新再试"
          }
          
          timer.value = setInterval(() => {
          if (countdown.value > 0) {
              countdown.value--;
              } else {
                  clearInterval(timer as unknown as NodeJS.Timeout);
                  timer.value = null;
              }
          }, 1000);
      }catch(error){
          console.error('Error sending SMS:', error);
          return "发送验证码出错, 请重新再试"
      }
      console.log("get verify code, countdown value is :", countdown.value)

  }
}

export {getColorForTitle, scrollToBottom, renderMarkdown, clearLoginData, generateRandomNumber, convertFourDigitsToTwoLetters}