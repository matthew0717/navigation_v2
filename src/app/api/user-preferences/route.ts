import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 配置文件路径
const configPath = path.join(process.cwd(), 'src/app/api/data/config.json');

/**
 * 获取用户配置数据
 * @returns 用户配置数据
 */
export async function GET() {
  try {
    // 读取配置文件
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    // 返回用户配置数据
    return NextResponse.json(config.user.preferences);
  } catch (error) {
    console.error('获取用户配置失败:', error);
    return NextResponse.json(
      { error: '获取用户配置失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新用户配置数据
 * @param request 请求对象
 * @returns 更新结果
 */
export async function PUT(request: NextRequest) {
  try {
    // 获取请求体
    const body = await request.json();
    
    // 读取配置文件
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    // 更新用户配置
    config.user.preferences = {
      ...config.user.preferences,
      ...body
    };
    
    // 写入配置文件
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新用户配置失败:', error);
    return NextResponse.json(
      { error: '更新用户配置失败' },
      { status: 500 }
    );
  }
} 