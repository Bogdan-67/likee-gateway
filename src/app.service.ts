import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { KnownDevices } from 'puppeteer';
const iPhone = KnownDevices['Galaxy Tab S4 landscape'];

@Injectable()
export class AppService {
  async getVideoInfo(uri: string): Promise<any> {
    uri = 'https://l.likee.video/v/B0qECv';
    const browser = await puppeteer.launch({
      headless: true, // Можно включить headless: true для работы в фоне
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=375,812', // Размер экрана iPhone X
      ],
    });

    const page = await browser.newPage();

    // Эмулируем мобильное устройство
    await page.emulate(iPhone);

    try {
      await page.goto(uri, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (error) {
      console.error('Ошибка загрузки страницы:', error);
    }

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
