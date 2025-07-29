# 用一个简单 demo 理解 Webpack Module Federation

### TL;DR
这是一篇用最小 demo 帮你理解`Webpack Module Federation`的文章。没有微前端术语，没有复杂部署，只展示最核心的一件事：**如何在主应用中动态加载另一个项目里暴露出来的组件**。

适合没接触过`Module Federation`的同学快速入门。最终的效果如下图所示：

![](https://cdn.nlark.com/yuque/0/2025/png/22036110/1746731320314-7bbb592e-f4ea-4715-8f82-fffa83a5d51e.png)

### 模块联邦是什么
[Webpack Module Federation（模块联邦）](https://webpack.docschina.org/concepts/module-federation/)是从 Webpack 5 开始引入的一项功能，**核心目的是解决多个独立应用之间共享模块和代码复用的问题**。它的设计初衷是解决模块复用、依赖共享和多团队协作中的一些难题，是构建现代微前端架构的核心能力之一。

> 多个独立的构建可以组成一个应用程序，这些独立的构建之间不应该存在依赖关系，因此可以单独开发和部署它们。
>
> 这通常被称作微前端，但并不仅限于此。
>

### 模块联邦可以做什么
Webpack Module Federation主要解决了以下几个前端开发中的实际问题：

#### 1. **实现多个独立项目间的模块共享**
+ **问题**：以前如果多个团队维护多个项目（如多个微前端），每个项目都要独立打包部署，难以共享组件库或逻辑模块。
+ **解决方案**：Module Federation 允许一个项目加载另一个项目暴露出来的模块，就像本地模块一样使用，而不需要重新打包这些模块。

#### 2. **动态远程加载模块，支持异步更新**
+ **问题**：传统的包共享通常依赖 npm 安装，更新依赖需要重新打包部署。
+ **解决方案**：模块联邦支持在运行时远程加载模块，比如从另一个域名获取组件库，可以实现 **“热更新组件”** 而不用重新部署主应用。

#### 3. **避免重复打包、减小 bundle 体积**
+ **问题**：多个应用如果都使用 React、Lodash 等库，会各自打包，浪费空间、增加加载时间。
+ **解决方案**：Module Federation 支持共享依赖（shared），只打包一次共享模块，多个项目共用。

#### 4. **解耦团队开发、支持独立部署**
+ **问题**：微前端架构中，多个团队协作开发不同模块时，耦合度高、协作成本大。
+ **解决方案**：模块联邦支持每个子应用独立开发、独立部署，主应用只在运行时加载，**增强解耦与独立性**。



**举个例子：**

假设你有两个项目：

+ `app1` 是主应用
+ `app2` 是一个组件库，暴露了 `Button`

你可以通过 Module Federation 在 `app1` 中直接使用 `app2` 的 `Button`：

```javascript
// app1 webpack.config.js
plugins: [
  new ModuleFederationPlugin({
    remotes: {
      app2: 'app2@http://localhost:3002/remoteEntry.js',
    },
  }),
]
```

```javascript
// 在 app1 中使用 app2 的 Button
import Button from 'app2/Button'
```

---

### 用例实现
这个 demo 模拟了上面那种典型的**多个独立项目间的模块共享**场景，这里新建三个项目：

+ `home-app`：应用通过 Module Federation  **暴露**`List.tsx`组件；
+ `course-app`：应用通过 Module Federation **加载/消费**`home-app/List.tsx`组件，同时通过 Module Federation **暴露**自身整个`App.tsx`应用；
+ `act-app`：应用通过 Module Federation **加载/消费**`course-app/App.tsx`整个应用。

![](https://cdn.nlark.com/yuque/0/2025/png/22036110/1746731320314-7bbb592e-f4ea-4715-8f82-fffa83a5d51e.png)



#### 初始化 React App 并引导项目
首先，我们用`Webpack + TypeScript`创建一个`React App` **home-app**。



我们需要创建`bootstrap.tsx`文件用于异步加载应用。这是由于在**Module Federation**中，子应用的加载是动态完成的，因此我们需要一个入口文件来引导整个项目。

> 因为远程模块的加载是异步的，所以推荐将应用的启动逻辑放在`bootstrap.tsx`中，在`index.tsx`中用动态 `import('./bootstrap')` 方式加载，避免`ReactDOM.render`提前执行。
>



在`src`目录下创建`bootstrap.tsx`：

```tsx
import App from './App'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element')
const root = createRoot(container)

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```



然后在`index.tsx` 中动态导入`bootstrap.tsx`，实现代码分离：

```tsx
import('./bootstrap')

export {}
```



#### 配置 Webpack 和 Module Federation 插件
在项目根目录下创建`webpack.config.js`文件：

```javascript
const path = require('path')
const { ModuleFederationPlugin } = require('webpack').container
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const deps = require('./package.json').dependencies

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    publicPath: 'auto',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'HOMEAPP',
      filename: 'remoteEntry.js',
      exposes: {
        './List': './src/components/List',
      },
      shared: [
        {
          react: {
            requiredVersion: deps.react,
            singleton: true,
            eager: true,
          },
          'react-dom': {
            requiredVersion: deps['react-dom'],
            singleton: true,
            eager: true,
          },
          ...deps,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    hot: true,
    open: true,
  },
}
```

**插件说明**

`ModuleFederationPlugin` 是实现微前端的关键插件：

+ `name`: 表示该应用的唯一标识（例如：**HOMEAPP**）。
+ `filename`: 是暴露的远程入口文件。
+ `exposes`: 用于指定要暴露给其他应用的模块（例如：`App.tsx`**, **`List.tsx`）。
+ `shared`: 则声明了共享依赖，使用`singleton: true`可确保 **React **等库只加载一次。



#### 配置应用
在前文中我们已完成`home-app`的基础配置，接下来将继续完善各应用内容，并用同样的方式依次配置`course-app`与`act-app`。

##### home-app：暴露组件模块
在 `home-app`中，我们实现了一个带样式和可配置参数的 UI 列表组件 `List.tsx`，并将其集成进主应用 `App.tsx` 中展示。随后，借助`ModuleFederationPlugin`的`exposes`配置，将该组件对外暴露，供其他项目使用。

`home-app`**端口号设置为**`3000`。

![](https://cdn.nlark.com/yuque/0/2025/png/22036110/1746730348783-0c8189e1-682e-4dae-99d3-6ee31ac70324.png)

**ModuleFederationPlugin 配置伪代码：**

使用`exposes`配置暴露模块时：

+ `./List`是对外暴露的模块名（远程访问时的引用名）；
+ `./src/components/List` 是实际本地文件路径；

```javascript
const path = require('path')
const { ModuleFederationPlugin } = require('webpack').container

const deps = require('./package.json').dependencies

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'HOMEAPP',
      filename: 'remoteEntry.js',
      exposes: {
        './List': './src/components/List',
      },
      shared: [
        {
          react: {
            requiredVersion: deps.react,
            singleton: true,
            eager: true,
          },
          'react-dom': {
            requiredVersion: deps['react-dom'],
            singleton: true,
            eager: true,
          },
          ...deps,
        },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    hot: true,
    open: true,
  },
}
```

##### course-app：消费组件并暴露自身应用
`course-app`的主要作用是远程加载`home-app`中的`List`组件，并集成进自己的页面结构中。同时，为了供其他系统复用，也通过`Module Federation`将整个`App.tsx`暴露出去。

`course-app`**端口号设置为**`3001`。

![](https://cdn.nlark.com/yuque/0/2025/png/22036110/1746730787175-75e3c3b4-0661-4fe3-ab51-8bcc8477fcc3.png)

**ModuleFederationPlugin 配置伪代码：**

使用`exposes`配置暴露模块时：

+ `./App`是对外暴露的模块名（远程访问时的引用名）；

使用`remote`引入远程模块时：

+ `HOMEAPP`是本地使用时的引用名，`HOMEAPP@.../remoteEntry.js`'中`HOMEAPP`必须与远程项目中的`name`一致（在它的`ModuleFederationPlugin`中声明的`name`）；
+ 在代码中通过`import()`方式异步引入`const List = React.lazy(() => import('homeApp/List'))`；

```javascript
const path = require('path')
const { ModuleFederationPlugin } = require('webpack').container

const deps = require('./package.json').dependencies

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'COURSEAPP',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      remotes: {
        HOMEAPP: 'HOMEAPP@http://localhost:3000/remoteEntry.js',
      },
      shared: [
        {
          react: {
            requiredVersion: deps.react,
            singleton: true,
            eager: true,
          },
          'react-dom': {
            requiredVersion: deps['react-dom'],
            singleton: true,
            eager: true,
          },
          ...deps,
        },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3001,
    hot: true,
    open: true,
  },
}
```

**消费远程模块代码：**

`List`为远程模块。

```tsx
import React from 'react'
import './App.scss'

const List = React.lazy(() => import('HOMEAPP/List'))
import Detail from './components/Detail'

function App() {
  return (
    <div className="course-app">
      <h1>Course App</h1>
      <Detail />
      <br />
      <List />
    </div>
  )
}

export default App
```

##### act-app：加载远程应用
最后，`act-app`则扮演“集成者”角色，直接远程加载`course-app`的整个应用模块 App，并将其嵌入到本地渲染逻辑中，实现完整的远程模块嵌入效果。

`act-app`**端口号设置为**`3002`。

![](https://cdn.nlark.com/yuque/0/2025/png/22036110/1746731533466-931496c4-f8ed-44fe-ab7a-89ca9a258e76.png)

**ModuleFederationPlugin 配置伪代码：**

使用`remote`引入远程模块时：

+ `COURSEAPP`是本地使用时的引用名，`COURSEAPP@.../remoteEntry.js`'中`COURSEAPP`必须与远程项目中的`name`一致（在它的`ModuleFederationPlugin`中声明的`name`）；
+ 在代码中通过`import()`方式异步引入`const CourseApp = React.lazy(() => import('COURSEAPP/App'))`；

```javascript
const path = require('path')
const { ModuleFederationPlugin } = require('webpack').container

const deps = require('./package.json').dependencies

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'ACTAPP',
      filename: 'remoteEntry.js',
      remotes: {
        COURSEAPP: 'COURSEAPP@http://localhost:3001/remoteEntry.js',
      },
      shared: [
        {
          react: {
            requiredVersion: deps.react,
            singleton: true,
            eager: true,
          },
          'react-dom': {
            requiredVersion: deps['react-dom'],
            singleton: true,
            eager: true,
          },
          ...deps,
        },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3002,
    hot: true,
    open: true,
  },
}
```

**消费远程模块代码：**

`CourseApp`为远程模块。

```tsx
import React from 'react'
import './App.scss'

const CourseApp = React.lazy(() => import('COURSEAPP/App'))

function App() {
  return (
    <div className="act-app">
      <h1>Act App</h1>
      <h2 className='act-Content'>Act App Content</h2>
      <CourseApp />
    </div>
  )
}

export default App
```

##### 最终实现效果图
![](https://cdn.nlark.com/yuque/0/2025/png/22036110/1746731775452-d14698dc-2f50-4623-874f-875fb39e9cf2.png)



### 总结回顾
本文通过一个最小可运行的 Demo，介绍了如何使用`Webpack Module Federation`在多个独立的`React`项目之间共享组件和页面。

我们从配置`home-app`开始，依次实现了组件的暴露、远程加载和整合渲染，在`course-app`中引入了单一的远程组件模块，也最终在`act-app`中动态展示了远程项目的内容。

如果你想快速掌握模块联邦的基本用法，并了解跨项目组件共享的实现方式，这个 Demo 是一个不错的参考起点。

### 扩展阅读
+ 由Webpack Module Federation的作者设计和开发的官方插件 module-federation：[https://github.com/module-federation](https://github.com/module-federation)
+ 官方插件 module-federation 模块联邦示例代码：[https://github.com/module-federation/module-federation-examples](https://github.com/module-federation/module-federation-examples)
+ 深入了解模块联邦：[https://scriptedalchemy.medium.com/understanding-webpack-module-federation-a-deep-dive-efe5c55bf366](https://scriptedalchemy.medium.com/understanding-webpack-module-federation-a-deep-dive-efe5c55bf366)

