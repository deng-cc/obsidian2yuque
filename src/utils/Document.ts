// import * as yamlFront from "yaml-front-matter";
import LarkClient from './LarkClient';
const { v4: uuidv4 } = require('uuid');


export interface DocumentConfig {
  originFile: string,
  slug: string,
  title: string,
  body: string,
}

export default class Document {
  body!: string;
  title!: string;
  slug!: string;
  lark: LarkClient;
  raw: string;
  id?: number;

  constructor(lark: LarkClient, file: string, title?: string) {
    this.lark = lark;
    this.title = title ?? '';
    this.raw = file;
  }

  async createDoc(layout?: string) {
    let body: any = [];
    let prevLine = '';

    const lines = this.raw?.split('\n') ?? [];
    for (const line of lines) {
      if (!this.title) {
        if (line.startsWith('# ')) {
          this.title = line.replace('# ', '');
          continue;
        }
        if (line.startsWith('====')) {
          this.title = prevLine;
          body.shift();
          continue;
        }
      }
      prevLine = line;
      body.push(line);
    }

    body = body.join('\n').trim();

    this.title = this.title.trim();
    this.body = body;
    this.body = this.body;

    this.loadConfig();

    return this;
  }

  loadConfig() {
	//slug 只包含字母、数字和连字符，如果使用base64生成，可能出现补位的=号，从而错误
    this.slug = uuidv4();
  }

  async dump() {
    await this.createDoc();
    return {
      originFile: this.raw,
      slug: this.slug,
      title: this.title,
      body: this.body,
    };
  }

  validate() {
    const result: {
      valid: boolean;
      messages: string[];
    } = {
      valid: true,
      messages: [],
    };
    if (!this.title) {
      result.valid = false;
      result.messages.push('缺少文章标题');
    }
    if (!/\w+/.test(this.slug)) {
      result.valid = false;
      result.messages.push('文件名只能是字母、数字、_和-');
    }
    return result;
  }
}
