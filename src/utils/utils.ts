
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import MarkdownIt from 'markdown-it'

const colors = [
	"#F2994A", // 活力橙色
	"#27AE60", // 清新绿色
	"#EB5757", // 柔和红色
];
const md = new MarkdownIt();

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

export {getColorForTitle, scrollToBottom, renderMarkdown, clearLoginData, generateRandomNumber, convertFourDigitsToTwoLetters}