
# Server Hardening & Operational Security

This document covers SSH configuration, fail2ban setup, and general server hardening practices.

## SSH Configuration

### Secure SSH Setup (/etc/ssh/sshd_config)

```bash
# Disable root login
PermitRootLogin no

# Key-based authentication only
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM yes

# Strong ciphers only
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group16-sha512

# Connection limits
MaxAuthTries 3
MaxSessions 2
LoginGraceTime 30

# Enable logging
LogLevel VERBOSE
SyslogFacility AUTH
```

## Fail2Ban Configuration

### Intrusion Prevention (/etc/fail2ban/jail.local)

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

## System Hardening Checklist

### User and Permission Management

- [ ] Disable unused user accounts
- [ ] Remove unnecessary packages and services
- [ ] Configure proper file permissions (644 for files, 755 for directories)
- [ ] Enable sudo logging
- [ ] Set up proper user groups and permissions

### Kernel and System Security

- [ ] Enable kernel address space layout randomization (ASLR)
- [ ] Disable unused kernel modules
- [ ] Configure system audit logging (auditd)
- [ ] Set up proper mount options (noexec, nosuid, nodev)
- [ ] Enable automatic security updates

### Network Security

- [ ] Disable unused network services
- [ ] Configure iptables/UFW firewall rules
- [ ] Disable IP forwarding (unless required)
- [ ] Enable TCP SYN flood protection
- [ ] Configure proper DNS settings

## Process Monitoring

### System Resource Monitoring

```bash
# Monitor system resources
htop
iotop
nethogs

# Check for suspicious processes
ps aux | grep -v "\[.*\]" | sort -k3 -nr | head -20

# Monitor network connections
netstat -tulpn
ss -tulpn
```

### Log Analysis

```bash
# Check authentication logs
journalctl -u ssh
tail -f /var/log/auth.log

# Monitor failed login attempts
grep "Failed password" /var/log/auth.log | tail -10

# Check system logs
journalctl -xe
dmesg | tail -20
```

## Automated Security Updates

### Unattended Upgrades Configuration

```bash
# Install unattended-upgrades
apt update && apt install unattended-upgrades

# Configure automatic security updates
echo 'Unattended-Upgrade::Automatic-Reboot "true";' >> /etc/apt/apt.conf.d/50unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot-Time "02:00";' >> /etc/apt/apt.conf.d/50unattended-upgrades

# Enable the service
systemctl enable unattended-upgrades
systemctl start unattended-upgrades
```

## File Integrity Monitoring

### AIDE Configuration

```bash
# Install AIDE
apt install aide

# Initialize database
aideinit

# Set up daily checks
echo "0 6 * * * root /usr/bin/aide --check" >> /etc/crontab
```

## Security Compliance

### CIS Benchmark Implementation

- [ ] Implement CIS Ubuntu Linux 20.04 LTS Benchmark
- [ ] Configure password policies
- [ ] Set up account lockout policies
- [ ] Enable security banners
- [ ] Configure time synchronization (NTP)

### Regular Security Tasks

- [ ] Weekly vulnerability scans
- [ ] Monthly access review
- [ ] Quarterly penetration testing
- [ ] Annual security audit
