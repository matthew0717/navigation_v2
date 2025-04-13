import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 配置文件路径
const configPath = path.join(process.cwd(), 'src/app/api/data/config.json');

/**
 * 获取热门网站数据
 * @returns 热门网站数据
 */
export async function GET() {
  try {
    // 读取配置文件
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    // 返回热门网站数据
    return NextResponse.json(config.hotSites);
  } catch (error) {
    console.error('获取热门网站失败:', error);
    return NextResponse.json(
      { error: '获取热门网站失败' },
      { status: 500 }
    );
  }
} 