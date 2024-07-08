## 利用linux各种命名空间实现隔离
类似这样的 namespace 一共有 6 种：

- PID namespace： 进程 id 的命名空间
- IPC namespace： 进程通信的命名空间
- Mount namespace：文件系统挂载的命名空间
- Network namespace：网络的命名空间
- User namespace：用户和用户组的命名空间
- UTS namespace：主机名和域名的命名空间


## 利用linux操作系统的 Control Group 机制
可以指定参数分配CPU、内存、磁盘等

## 设计了 UnionFS 做文件系统的分层镜像存储、镜像合并
使得存储效率提高，同时镜像可以共享。  

通过 dockerfile 描述镜像构建的过程，每一条指令都是一个镜像层。

镜像通过 docker run 就可以跑起来，对外提供服务，这时会添加一个可写层（容器层）。

挂载一个 volume 数据卷到 Docker 容器，就可以实现数据的持久化。