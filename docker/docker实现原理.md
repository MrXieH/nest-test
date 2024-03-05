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