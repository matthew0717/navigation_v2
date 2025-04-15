import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sign } from 'jsonwebtoken';

// 获取数据文件路径
const dataFilePath = path.join(process.cwd(), 'src/app/api/data/users.json');

// 读取数据文件
const readDataFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据文件失败:', error);
    return { users: [] };
  }
};

// 写入数据文件
const writeDataFile = (data: any) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('写入数据文件失败:', error);
  }
};

/**
 * GitHub 回调 API 路由
 * 处理 GitHub OAuth 回调，获取用户信息并创建或更新用户
 */
export async function GET(request: NextRequest) {
  try {
    // 获取授权码
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      console.error('GitHub 回调缺少授权码');
      return NextResponse.json(
        { error: 'GitHub 回调缺少授权码' },
        { status: 400 }
      );
    }
    
    // 获取 GitHub OAuth 配置
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_CALLBACK_URL;
    
    if (!clientId || !clientSecret || !redirectUri) {
      console.error('GitHub OAuth 配置缺失');
      return NextResponse.json(
        { error: 'GitHub OAuth 配置缺失' },
        { status: 500 }
      );
    }
    
    // 获取访问令牌
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('获取 GitHub 访问令牌失败:', tokenData.error_description);
      return NextResponse.json(
        { error: '获取 GitHub 访问令牌失败' },
        { status: 400 }
      );
    }
    
    // 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });
    
    const userData = await userResponse.json();
    
    // 获取用户邮箱
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });
    
    const emailData = await emailResponse.json();
    
    // 查找主要邮箱
    const primaryEmail = emailData.find((email: any) => email.primary)?.email || emailData[0]?.email;
    
    // 读取用户数据
    const data = readDataFile();
    
    // 查找用户
    let user = data.users.find((u: any) => u.githubId === userData.id);
    
    if (!user) {
      // 创建新用户
      user = {
        id: `user-${Date.now()}`,
        githubId: userData.id,
        name: userData.name || userData.login,
        email: primaryEmail || null,
        avatar: userData.avatar_url,
        isVerified: !!primaryEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      data.users.push(user);
      writeDataFile(data);
    } else {
      // 更新用户信息
      user.name = userData.name || userData.login;
      user.avatar = userData.avatar_url;
      user.updatedAt = new Date().toISOString();
      user.lastLogin = new Date().toISOString();
      
      // 如果用户没有邮箱，但有主要邮箱，则更新邮箱
      if (!user.email && primaryEmail) {
        user.email = primaryEmail;
        user.isVerified = true;
      }
      
      writeDataFile(data);
    }
    
    // 生成 JWT 令牌
    const token = sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // 重定向到首页，并设置 cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 天
    });
    
    return response;
  } catch (error) {
    console.error('GitHub 回调处理失败:', error);
    return NextResponse.json(
      { error: 'GitHub 回调处理失败' },
      { status: 500 }
    );
  }
} 