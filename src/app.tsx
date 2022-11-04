import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import { defineApp, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

const fetchUserInfo = async () => {
  try {
    const msg = await queryCurrentUser({
      skipErrorHandler: true,
    });
    return msg.data;
  } catch (error) {
    history.push(loginPath);
  }
  return undefined;
};

export default defineApp({
  /**
   * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
   * */
  getInitialState: async (): Promise<{
    settings?: Partial<LayoutSettings>;
    currentUser?: API.CurrentUser;
    loading?: boolean;
    fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  }> => {
    // 如果不是登录页面，执行
    if (window.location.pathname !== loginPath) {
      const currentUser = await fetchUserInfo();
      return {
        fetchUserInfo,
        currentUser,
        settings: defaultSettings,
      };
    }
    return {
      fetchUserInfo,
      settings: defaultSettings,
    };
  },

  // ProLayout 支持的api https://procomponents.ant.design/components/layout
  layout: ({ initialState, setInitialState }) => {
    return {
      rightContentRender: () => <RightContent />,
      waterMarkProps: {
        content: initialState?.currentUser?.name,
      },
      footerRender: () => <Footer />,
      onPageChange: () => {
        const { location } = history;
        // 如果没有登录，重定向到 login
        if (!initialState?.currentUser && location.pathname !== loginPath) {
          history.push(loginPath);
        }
      },
      layoutBgImgList: [
        {
          src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
          left: 85,
          bottom: 100,
          height: '303px',
        },
        {
          src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
          bottom: -68,
          right: -45,
          height: '303px',
        },
        {
          src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
          bottom: 0,
          left: 0,
          width: '331px',
        },
      ],
      links: isDev
        ? [
            <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
              <LinkOutlined />
              <span>OpenAPI 文档</span>
            </Link>,
          ]
        : [],
      menuHeaderRender: undefined,
      // 自定义 403 页面
      // unAccessible: <div>unAccessible</div>,
      // 增加一个 loading 的状态
      childrenRender: (children, props) => {
        // if (initialState?.loading) return <PageLoading />;
        return (
          <>
            {children}
            {!props.location?.pathname?.includes('/login') && (
              <SettingDrawer
                disableUrlParams
                enableDarkTheme
                settings={initialState?.settings}
                onSettingChange={(settings) => {
                  setInitialState((preInitialState) => ({
                    ...preInitialState,
                    settings,
                  }));
                }}
              />
            )}
          </>
        );
      },
      ...initialState?.settings,
    };
  },

  /**
   * @name request 配置，可以配置错误处理
   * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
   * @doc https://umijs.org/docs/max/request#配置
   */
  request: {
    ...errorConfig,
  },
});
