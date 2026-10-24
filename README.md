# DockerStats · Docker 官方镜像数据站

**全部 library 官方镜像**(docker-library/official-images 清单,~200 个):每个镜像一页——总拉取量、星标、最近 50 个标签及推送时间。"nginx latest docker tag" / "postgres image versions" 这类查询的着陆页。数据 Docker Hub 公开 API,CI 日更。

三个不掺假的事,与站群其他站同一套纪律:

- 数值要么来自 Docker Hub 接口,要么缺失;标签是"最近 N 个"的时新视图,页面如实标注非全量。
- 镜像清单来自官方 official-images 仓库,不自造名单。
- hub.docker.com 对部分出口(含本沙盒)不通,同步在 GitHub Actions 上跑,数据落仓库分发。

## 站点结构

| 路径 | 内容 | SEO 角色 |
|---|---|---|
| `/image/[name]` | 镜像页 ×~200:拉取量/星标/最近标签表 | 长尾主力:"nginx docker tags" |
| `/images` | 按首字母目录 | 内链枢纽 |
| `/rankings` | 拉取量 Top 100 | "most pulled docker images" |
| `/api/image` | JSON(CORS 全开,?name= / ?q=) | agent 数据口 |

## 本地跑起来 / 部署

```bash
npm install && npm run dev        # 本地(数据在 data/docker-hub.json)
npm test && npm run build
```

Vercel 导入零配置;CI 每日同步 + 体检开 issue;广告位已埋,配 `NEXT_PUBLIC_ADSENSE_CLIENT` 即激活。
