现阶段项目的发布需要**<font style="color:#DF2A3F;">手动</font>**在**本地机器上构建 -> 上传构建产物 -> 备份线上版本 -> 替换线上版本为构建产物**。这种方案会存在以下几种问题：

1. **人工干预与错误风险**
    - 人为失误：每一步都需要手动操作，容易出现忘记某些步骤、错误执行命令或配置不一致的情况，导致上线过程不可靠。
    - 不一致性：每次手动部署时，环境和配置可能存在差异，可能导致本地开发环境与生产环境之间的偏差，从而引发问题。
2. **回滚困难**
    - 手动回滚：如果部署失败，需要手动备份并恢复到之前的版本，过程繁琐，容易遗漏或出错，影响系统稳定性。
3. **难以管理与追踪**
    - 缺乏日志与监控：手动流程难以记录详细的部署日志，难以追踪每次部署的详细信息（如哪些代码变更、配置变动等）。
    - 版本控制不完善：在手动操作中，备份和版本控制可能不够规范，导致难以追溯问题或恢复到某个特定版本。



因此，采用**CI/CD（持续集成/持续部署）** 来实现自动化部署，成为了解决这一问题的最佳方式。Gitee中已经提供了**流水线**的服务，所以我们将基于Gitee的流水线以较低的成本实现**CI/CD。**

## 触发事件
流水线会根据分支对应的事件触发进行流水线的构建流程，因此我们需要先**规范化**线上、测试环境的分支。

目前项目只需要区分线上`release`、测试`test`即可，规则如下：

1. **<font style="color:#FFFFFF;background-color:#DF2A3F;"> release</font>**<font style="color:#FFFFFF;background-color:#DF2A3F;">（线上分支&保护分支）</font>：**仅接受Pull Request，不允许Push。合并PR时触发流水线**![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734689720685-249afd99-0c8a-4c37-a03e-794e25951b13.png)![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734689856611-d538f1ee-2c65-4257-a1e2-cef21c77e273.png)



2. **<font style="background-color:#FBDE28;"> test（测试分支）</font>****：允许Pull Request、Push。合并PR、Push时触发流水线**![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734689822185-5e282ad4-0930-4a91-b88a-688d340b4909.png)

## 任务编排
任务编排只需要三个步骤（后续需要在云端进行版本控制时，可以在上传步骤后添加一个发布流程步骤）。

![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734690108837-9c5e601f-72ee-4b22-b145-38fecfccd63f.png)

### Nodejs构建
1. 不久前已经让项目支持[用脚本打包不同环境的代码](https://www.yuque.com/u21637395/pvalrk/ob4p91qd6dm9zgqk)，所以打包时直接运行对应环境的构建脚本`npm run build:test`，打包出产物`dist`。

![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734772477674-f17e7cd6-dd0e-4ac2-8137-f1ae18a17a75.png)

### 上传制品
将上游任务产生的暂存构建物上传到制品库中永久保留，上传过的制品可以在流水线的发布记录中查看。

![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734772702337-7c67b9c1-97bc-47f1-a8a0-47b83b63d913.png)

### 主机部署
将产物推送到服务器，<font style="color:rgb(46, 64, 94);">Gitee 流水线中的制品是一个 tar.gz 的压缩包，安装项目的要求配置好部署脚本即可。</font>

<font style="color:rgb(46, 64, 94);">部署脚本的执行流程如下：</font>

1. 解压最新产物压缩包文件内的`/dist` 到 `${NEW_RELEASE}（NEW_RELEASE为此次提交的前7位commit）` 目录下。
2. 复制最新产物`${NEW_RELEASE}`的内容到线上版本的文件夹`/sync-dist`中，覆盖替换所有文件（此次操作是为了保留上一版本的文件，避免影响到未更新网页的用户访问）。
3. 复制包含**新旧版本产物**的文件夹`/sync-dist`的内容到`${NEW_RELEASE}`文件夹中（作为版本控制文件夹）。
4. 更新软链接`dist`指向新版本目录`${NEW_RELEASE}`，**完成网站发布**。

```bash
# 定义变量
TAR_FILE=~/gitee_go/deploy/output.tar.gz                 # 压缩包路径
RELEASE_DIR="/root/www/test-web/web"                     # 发布目录
NEW_RELEASE="${RELEASE_DIR}/build/${GITEE_SHORT_COMMIT}" # 新版本目录
CURRENT_LINK="${RELEASE_DIR}/dist"                       # 软链接路径
SYNC_CURRENT_LINK="${RELEASE_DIR}/sync-dist"             # 同步的线上路径

echo "开始部署新版本..."

# 确保临时目录和新版本目录存在
mkdir -p "${CURRENT_LINK}"
mkdir -p "${SYNC_CURRENT_LINK}"
mkdir -p "${NEW_RELEASE}"

# 解压文件内的 /dist 到 /NEW_RELEASE 目录下
echo "解压 ${TAR_FILE} 中的 /dist 到 ${NEW_RELEASE}"
tar -zxvf "${TAR_FILE}" -C "${NEW_RELEASE}"

# 确保解压成功
if [ $? -eq 0 ]; then
  echo "解压成功，将 ${NEW_RELEASE} 内容覆盖 ${SYNC_CURRENT_LINK}..."

  cp -r "${NEW_RELEASE}/dist/"* "${NEW_RELEASE}"
  rm -rf "${NEW_RELEASE}/dist"

  # 将 /sync-dist 中的内容复制到 NEW_RELEASE 目录
  cp -r "${NEW_RELEASE}/"* "${SYNC_CURRENT_LINK}"
  cp -r "${SYNC_CURRENT_LINK}/"* "${NEW_RELEASE}"

  # 更新软链接指向新版本目录
  ln -sfn "${NEW_RELEASE}" "${CURRENT_LINK}"

  echo "软链接更新完成，现在的 dist 指向：$(readlink -f ${CURRENT_LINK})"
else
  echo "解压失败，部署终止"
  rm -rf "${NEW_RELEASE}" # 删除解压失败的目录
  exit 1
fi

echo "部署完成！"
```

## 发布回滚
回滚的策略非常简单，因为我们已经在主机部署时做好了**版本控制**，回滚的执行只需要两步：

1. 软链接`dist`指向`需要回滚的目录（需要回滚的版本提交的前7位commit）`，**完成网站回滚发布**。
2. 清空线上同步目录`/sync-dist`的文件并同步`需要回滚的目录`到`/sync-dist`。

![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734784088457-73003e64-9132-496e-9af5-6817abae444b.png)

为方便执行回滚任务，在`/dist`目录下放置回滚脚本`rollback.sh`，修改文件内的`ROLLBACK_SHORT_COMMIT`变量，然后执行`sh rollback.sh`即可完成回滚任务。

```bash
#########################################################
#                      注意事项                          #
# 只需修改以下变量以指定需要回滚的版本号（PR的目标分支7位commit） #
# 示例：ROLLBACK_SHORT_COMMIT="357c4c6"                  #


ROLLBACK_SHORT_COMMIT="357c4c6"


#########################################################
#########################################################

RELEASE_DIR="/root/www/test-web/web"                        # 发布目录
CURRENT_LINK="${RELEASE_DIR}/dist"                          # 当前软链接路径
BACKUP_LINK="${RELEASE_DIR}/build/${ROLLBACK_SHORT_COMMIT}" # 备份软链接路径
SYNC_CURRENT_LINK="${RELEASE_DIR}/sync-dist"                # 同步的线上路径

echo "BACKUP_LINK ${BACKUP_LINK}"

echo "开始回滚到之前的版本..."

# 检查备份软链接是否存在
if [ -e "${BACKUP_LINK}" ]; then
  echo "恢复备份版本..."

  # 回滚软链接指向备份版本
  ln -sfn "${BACKUP_LINK}" "${CURRENT_LINK}"

  echo "回滚成功，当前 dist 指向：$(readlink -f ${CURRENT_LINK})"

  rm -rf "${SYNC_CURRENT_LINK}/"*
  cp -r "${BACKUP_LINK}/"* "${SYNC_CURRENT_LINK}"
else
  echo "没有备份版本，无法回滚！"
  exit 1
fi

echo "回滚完成！"
```

## 任务执行状态通知
这里选用**<font style="color:rgb(0, 0, 0);">飞书 WebHook机器人</font>**<font style="color:rgb(0, 0, 0);">进行执行状态通知，具体通知显示如下：</font>

![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734785578471-9c07f2cf-6aa4-4041-8326-1f6e38194b04.png)![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734785625915-6b4a4132-c8b7-48ff-b44e-39697216cb29.png)

## 定价
<font style="color:rgb(0, 0, 0);">当前开通 Gitee Go 流水线，单个代码仓库均可直接获得 200 分钟免费构建时长，单个企业 / 组织每月 1000 分钟免费构建时长自动到账。</font>

<font style="color:rgb(0, 0, 0);">以</font>`<font style="color:rgb(0, 0, 0);">配音web</font>`<font style="color:rgb(0, 0, 0);">为例，单次构建任务平均为</font>**<font style="color:rgb(0, 0, 0);">4分钟</font>**<font style="color:rgb(0, 0, 0);">，单仓库免费构建时长允许构建</font>**<font style="color:rgb(0, 0, 0);">50次</font>**<font style="color:rgb(0, 0, 0);">，企业每月赠送时长允许构建</font>**<font style="color:rgb(0, 0, 0);">250次</font>**<font style="color:rgb(0, 0, 0);">。</font>

![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734784953041-22542c98-25cd-4b04-99f4-de048239ebe5.png)

超出部分：

![](https://cdn.nlark.com/yuque/0/2024/png/22036110/1734784969634-9f2d328a-f1f6-426d-9696-1b166e149a3e.png)

