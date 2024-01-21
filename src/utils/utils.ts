
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

export {getColorForTitle, scrollToBottom, renderMarkdown, clearLoginData}