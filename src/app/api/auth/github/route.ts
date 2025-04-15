import { NextRequest, NextResponse } from 'next/server';

/**
 * GitHub 登录 API 路由
 * 重定向用户到 GitHub 授权页面
 */
export async function GET(request: NextRequest) {
  try {
    // 获取 GitHub OAuth 配置
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_CALLBACK_URL;
    
    if (!clientId || !redirectUri) {
      console.error('GitHub OAuth 配置缺失');
      return NextResponse.json(
        { error: 'GitHub OAuth 配置缺失' },
        { status: 500 }
      );
    }
    
    // 构建 GitHub 授权 URL
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    
    // 重定向到 GitHub 授权页面
    return NextResponse.redirect(githubAuthUrl);
  } catch (error) {
    console.error('GitHub 登录失败:', error);
    return NextResponse.json(
      { error: 'GitHub 登录失败' },
      { status: 500 }
    );
  }
} 