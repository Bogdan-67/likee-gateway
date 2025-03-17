import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { KnownDevices } from 'puppeteer';
const iPhone = KnownDevices['iPhone 15'];

@Injectable()
export class AppService {
  async getVideoInfo(uri: string): Promise<any> {
    uri = 'https://l.likee.video/p/H7rCwn';
    const browser = await puppeteer.launch({
      headless: false, // Можно включить headless: true для работы в фоне
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=375,812', // Размер экрана iPhone X
      ],
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true); // Включаем перехват запросов

    page.on('request', async (request) => {
      const url = request.url();
      if (url.includes('api.like-video.com') && request.method() === 'POST') {
        console.log(`🎯 Перехвачен API-запрос: ${url}`);
        console.log(`📌 Данные:`, request.postData());
      }
      request.continue();
    });

    // Эмулируем мобильное устройство
    await page.emulate(iPhone);

    try {
      await page.goto(uri, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (error) {
      console.error('Ошибка загрузки страницы:', error);
    }
    function wait(time) {
      return new Promise(resolve => {
        setTimeout(resolve, time);
      });
    }
    await wait(500000);
    // Достаем описание видео
    const jsonData = await page.evaluate(() => {
      // Получаем все теги <script>
      const scripts = Array.from(document.querySelectorAll('script'));

      // Ищем среди них тот, который содержит "window.data"
      const scriptTag = scripts.find((script) =>
        script.textContent?.includes('window.data'),
      );

      if (!scriptTag) return null; // Если не нашли, возвращаем null

      // Извлекаем JSON из строки, используя регулярное выражение
      const match = scriptTag.textContent?.match(
        /window\.data\s*=\s*(\{.*\});/,
      );

      return match ? match[1] : null;
    });

    await browser.close();

    let parsedData;

    if (jsonData) {
      parsedData = JSON.parse(jsonData);
      console.log('msg_text:', parsedData.msg_text);
    } else {
      console.log('JSON с window.data не найден');
    }

    return parsedData;
  }
}
