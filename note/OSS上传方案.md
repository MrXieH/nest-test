## OSS上传方案

### 前端值传

1. 服务端返回临时凭证给前端
2. 前端通过临时凭证直接上传到OSS

这样做的好处是，不需要经过服务端，直接上传，减轻了服务端的压力，但是需要处理临时凭证的过期问题，如果过期了，需要重新获取临时凭证。