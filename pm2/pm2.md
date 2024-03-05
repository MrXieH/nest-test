## 多进程跑应用实现负载均衡
```bash
pm2 start app.js -i max 
pm2 start app.js -i 0

会启动 -i n 个进程
```

```bash
# 动态调整进程
pm2 scale main 3

pm2 scale main +3
```

## 性能监控
```bash
pm2 monit
```


## ecosystem配置文件
```bash
# 生成配置文件，方便管理多个应用
pm2 ecosystem
```

pm2 plus 收费，有web网站，可监控应用