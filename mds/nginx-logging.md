## Implement logging service with nginx 
---
### Introduction
In data processing, there are a lot of cases that need collect logs. This requires a log collection server with high concurrency and good performance. The API of the server could be very simple. But the requirement of the performance of the logging api is very high, because it is possible that there would be thousands or even millions of requests per second. 
  
  
### Solution
Normally we could implement a simple java application logging with log4j or logback. But the performance of single instance of such an application is not high, we need sacle out with more instances to achieve better performance. That is not a good solution.

As the api is very simple, we could use [Nginx](https://nginx.org/en/) to implement it. Nginx is an HTTP and reverse proxy server, a mail proxy server, and a generic TCP/UDP proxy server. According to [Linux Web Server Performance Benchmark – 2016 Results](https://www.rootusers.com/linux-web-server-performance-benchmark-2016-results/), single nginx workload running on a 1 CPU core server could achieve 30K-35K requests per second.

### Code/Configuration
The implementation is very simple. We just need create a server section and use nginx access_log log the incoming request body. The following configure is a sample of a simple logging server
  
```
log_format  logging  '$time_iso8601||$remote_addr||$request_uri||$http_user_agent||$request_body';

server {
    listen       8080;
    server_name  localhost;
    
    if ($time_iso8601 ~ "^(\d{4})-(\d{2})-(\d{2})) {
        set $year $1;
        set $month $2;
        set $day $3;
    }

    location = /logging {
        access_log logs/$year-$month-$day-engine-lng.log logging;
        access_log logs/$host logging;
        proxy_pass http://localhost:8080/logsink;
        limit_except POST {
            deny all;
        }
    }

    location = /logsink {
        add_header 'Access-Control-Allow-Origin' '*';
        return 200;
    }
}

```  
The first line defines a log_format which verifies what information will be wrote into log file. Here we log **$request_body**, which means we could send the text that we want log in request body. From the [document](http://nginx.org/en/docs/http/ngx_http_core_module.html#var_request_body), we could know that  **$request_body**’s value is made available in locations processed by the proxy_pass, fastcgi_pass, uwsgi_pass, and scgi_pass directives when the request body was read to a memory buffer. That is why we proxy_pass request of */logging* to another location */logsink* which does nothing and just returns 200 directly.

The file path can contain variables (0.7.6+), but such logs have some [constraints](http://nginx.org/en/docs/http/ngx_http_log_module.html)

*   the user whose credentials are used by worker processes should have permissions to create files in a directory with such logs;
*   buffered writes do not work;
*   the file is opened and closed for each log write. However, since the descriptors of frequently used files can be stored in a cache, writing to the old file can continue during the time specified by the open_log_file_cache directive’s valid parameter
*   during each log write the existence of the request’s root directory is checked, and if it does not exist the log is not created. It is thus a good idea to specify both root and access_log on the same level:

