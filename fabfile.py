from fabric.api import *
import os
import sys
from fabric.contrib.project import rsync_project
from fabric.contrib.console import confirm
#
def deploy():
    result=run("uname -a")

    if result.succeeded:
      print "[PASSED] Connecting to remote server "+env.host_string
    else:
      print "[FAILED] Could *not* ssh into server "+env.host_string+"! Please fix the auto-ssh issue. Exiting!";
      sys.exit(1)

    run("whoami")

    with cd('/opt/funnyface'):
        run("git pull origin master")
        run("docker build ../funnyface -t funnyface")
        run("docker rm -f funnyface")
        run("docker run -d -p 8081:8080 --restart always --name funnyface funnyface")
