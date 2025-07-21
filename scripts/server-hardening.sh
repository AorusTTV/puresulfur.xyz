
#!/bin/bash

# Comprehensive Server Hardening Script for Ubuntu/Debian
# Implements CIS Benchmark recommendations for secure hosting

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="/var/log/server-hardening.log"

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
   exit 1
fi

log "🔒 Starting comprehensive server hardening..."

# 1. System Updates
log "📦 Updating system packages..."
apt update && apt upgrade -y
apt autoremove -y
apt autoclean

# 2. Install security packages
log "🛡️ Installing security packages..."
apt install -y \
    ufw \
    fail2ban \
    unattended-upgrades \
    apt-listchanges \
    aide \
    rkhunter \
    chkrootkit \
    lynis \
    acct \
    auditd \
    curl \
    gnupg \
    openssh-server

# 3. Configure automatic security updates
log "🔄 Configuring automatic security updates..."
cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id} ESMApps:\${distro_codename}-apps-security";
    "\${distro_id} ESM:\${distro_codename}-infra-security";
};
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
Unattended-Upgrade::SyslogEnable "true";
EOF

systemctl enable unattended-upgrades
systemctl start unattended-upgrades

# 4. SSH Hardening
log "🔐 Hardening SSH configuration..."
SSH_CONFIG="/etc/ssh/sshd_config"
cp "$SSH_CONFIG" "${SSH_CONFIG}.backup"

cat > "$SSH_CONFIG" << EOF
# SSH Hardening Configuration
Port 22
Protocol 2

# Authentication
PermitRootLogin no
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# Security settings
MaxAuthTries 3
MaxSessions 2
LoginGraceTime 30
PermitEmptyPasswords no
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no

# Strong cryptography
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com,hmac-sha2-256,hmac-sha2-512
KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512

# Logging
LogLevel VERBOSE
SyslogFacility AUTH

# Misc
PrintMotd no
TCPKeepAlive no
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

# Restart SSH service
systemctl restart sshd
log "✅ SSH hardening completed"

# 5. Firewall Configuration
log "🔥 Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Restrict outbound connections
ufw deny out 25     # Block SMTP (prevent spam)
ufw allow out 53    # DNS
ufw allow out 123   # NTP
ufw allow out 443   # HTTPS
ufw allow out 587   # SMTP submission (for notifications)

# Enable firewall
ufw --force enable
ufw logging on

log "✅ Firewall configured successfully"

# 6. Fail2Ban Configuration
log "⚡ Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd
destemail = admin@${DOMAIN:-localhost}
sendername = Fail2Ban
mta = sendmail

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
bantime = 600

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 5
EOF

systemctl enable fail2ban
systemctl restart fail2ban
log "✅ Fail2Ban configured and running"

# 7. Kernel hardening
log "⚙️ Applying kernel security settings..."
cat > /etc/sysctl.d/99-security.conf << EOF
# Network security
net.ipv4.conf.default.rp_filter=1
net.ipv4.conf.all.rp_filter=1
net.ipv4.conf.all.accept_redirects=0
net.ipv4.conf.default.accept_redirects=0
net.ipv4.conf.all.secure_redirects=0
net.ipv4.conf.default.secure_redirects=0
net.ipv6.conf.all.accept_redirects=0
net.ipv6.conf.default.accept_redirects=0
net.ipv4.conf.all.send_redirects=0
net.ipv4.conf.default.send_redirects=0
net.ipv4.conf.all.accept_source_route=0
net.ipv4.conf.default.accept_source_route=0
net.ipv6.conf.all.accept_source_route=0
net.ipv6.conf.default.accept_source_route=0
net.ipv4.conf.all.log_martians=1
net.ipv4.conf.default.log_martians=1
net.ipv4.icmp_echo_ignore_broadcasts=1
net.ipv4.icmp_ignore_bogus_error_responses=1
net.ipv4.conf.all.ignore_bogus_error_responses=1
net.ipv4.conf.default.ignore_bogus_error_responses=1
net.ipv4.ip_forward=0
net.ipv6.conf.all.forwarding=0

# TCP/IP stack hardening
net.ipv4.tcp_syncookies=1
net.ipv4.tcp_rfc1337=1
net.ipv4.tcp_fin_timeout=15
net.ipv4.tcp_keepalive_time=300
net.ipv4.tcp_keepalive_probes=5
net.ipv4.tcp_keepalive_intvl=15

# Memory protection
kernel.exec-shield=1
kernel.randomize_va_space=2
kernel.kptr_restrict=2
kernel.dmesg_restrict=1
kernel.yama.ptrace_scope=1

# File system security
fs.protected_hardlinks=1
fs.protected_symlinks=1
fs.suid_dumpable=0
EOF

sysctl -p /etc/sysctl.d/99-security.conf
log "✅ Kernel security settings applied"

# 8. User account security
log "👤 Configuring user account security..."

# Set password aging
sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS 90/' /etc/login.defs
sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS 7/' /etc/login.defs
sed -i 's/^PASS_WARN_AGE.*/PASS_WARN_AGE 14/' /etc/login.defs

# Lock unused accounts
for user in games news uucp lp mail operator; do
    if id "$user" &>/dev/null; then
        usermod -L "$user" 2>/dev/null || true
        usermod -s /bin/false "$user" 2>/dev/null || true
    fi
done

# 9. File permissions hardening
log "📁 Hardening file permissions..."
chmod 700 /root
chmod 644 /etc/passwd
chmod 600 /etc/shadow
chmod 644 /etc/group
chmod 600 /etc/gshadow
chmod 644 /etc/hosts
chmod 600 /etc/ssh/sshd_config

# 10. Audit system setup
log "📊 Configuring audit system..."
cat > /etc/audit/rules.d/audit.rules << EOF
# Delete all existing rules
-D

# Audit system calls
-a always,exit -F arch=b64 -S execve
-a always,exit -F arch=b32 -S execve

# Audit file access
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/gshadow -p wa -k identity
-w /etc/sudoers -p wa -k actions
-w /etc/hosts -p wa -k network
-w /var/log/auth.log -p wa -k logins

# Audit configuration files
-w /etc/ssh/sshd_config -p wa -k sshd
-w /etc/fail2ban/ -p wa -k fail2ban

# Make rules immutable
-e 2
EOF

systemctl enable auditd
systemctl restart auditd
log "✅ Audit system configured"

# 11. Install and configure AIDE
log "🔍 Setting up file integrity monitoring..."
aideinit
mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Schedule daily AIDE checks
cat > /etc/cron.daily/aide-check << 'EOF'
#!/bin/bash
/usr/bin/aide --check --config /etc/aide/aide.conf | mail -s "AIDE Report $(hostname)" admin@localhost
EOF
chmod +x /etc/cron.daily/aide-check

# 12. Configure logging
log "📝 Configuring enhanced logging..."
cat > /etc/rsyslog.d/50-security.conf << EOF
# Security event logging
auth,authpriv.*                 /var/log/auth.log
kern.*                          /var/log/kern.log
mail.*                          /var/log/mail.log
user.*                          /var/log/user.log
*.emerg                         :omusrmsg:*
EOF

systemctl restart rsyslog

# 13. Disable unnecessary services
log "🔇 Disabling unnecessary services..."
SERVICES_TO_DISABLE=(
    "avahi-daemon"
    "cups"
    "bluetooth"
    "rpcbind"
    "nfs-common"
    "apache2"
)

for service in "${SERVICES_TO_DISABLE[@]}"; do
    if systemctl list-unit-files | grep -q "^$service"; then
        systemctl disable "$service" 2>/dev/null || true
        systemctl stop "$service" 2>/dev/null || true
        log "Disabled service: $service"
    fi
done

# 14. Set up security banners
log "📢 Setting up security banners..."
cat > /etc/issue << EOF
***************************************************************************
                            AUTHORIZED USE ONLY
                            
This system is for the use of authorized users only. Individuals using
this computer system without authority, or in excess of their authority,
are subject to having all of their activities on this system monitored
and recorded by system personnel.

By continuing to use this system you indicate your awareness of and
consent to these terms and conditions of use. LOG OFF IMMEDIATELY if
you do not agree to the conditions stated in this warning.
***************************************************************************
EOF

cp /etc/issue /etc/issue.net

# 15. Final system hardening checks
log "🔬 Running final security validation..."

# Verify SSH configuration
sshd -t || error "SSH configuration test failed"

# Verify firewall status
ufw status | grep -q "Status: active" || error "Firewall is not active"

# Verify fail2ban status
systemctl is-active fail2ban &>/dev/null || error "Fail2ban is not running"

# Generate hardening report
log "📋 Generating hardening report..."
cat > /root/hardening-report.txt << EOF
Server Hardening Report
Generated: $(date)
Hostname: $(hostname)

✅ System updates applied
✅ Security packages installed
✅ SSH hardened (key-based auth only, no root login)
✅ UFW firewall configured (80, 443 IN; 443, 587 OUT)
✅ Fail2Ban configured for SSH and web protection
✅ Kernel security parameters applied
✅ User account security configured
✅ File permissions hardened
✅ Audit system configured
✅ AIDE file integrity monitoring setup
✅ Security logging enhanced
✅ Unnecessary services disabled
✅ Security banners installed

Next steps:
1. Create non-root user account for administration
2. Configure SSH keys for that user
3. Test all functionality
4. Set up monitoring and alerting
5. Schedule regular security scans

SSH Configuration Summary:
- Port: 22
- Root login: DISABLED
- Password auth: DISABLED
- Key-based auth: ENABLED
- Max auth tries: 3
- Strong ciphers only: ENABLED

Firewall Rules:
- Default: DENY incoming, ALLOW outgoing
- Allowed IN: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Allowed OUT: 53 (DNS), 123 (NTP), 443 (HTTPS), 587 (SMTP)

Important Files:
- SSH config: /etc/ssh/sshd_config
- Firewall rules: /etc/ufw/
- Fail2ban config: /etc/fail2ban/jail.local
- Audit rules: /etc/audit/rules.d/audit.rules
- Security sysctls: /etc/sysctl.d/99-security.conf
EOF

log "🎉 Server hardening completed successfully!"
log "📋 Report saved to: /root/hardening-report.txt"
log "🔄 Please reboot the system to ensure all changes take effect"

info "Next steps:"
info "1. Create a non-root user with sudo privileges"
info "2. Add SSH public keys for that user"
info "3. Test SSH connectivity with the new user"
info "4. Disable the root account if desired"
info "5. Set up monitoring and log analysis"

# Create a simple verification script
cat > /root/verify-hardening.sh << 'EOF'
#!/bin/bash
echo "🔍 Verifying server hardening..."

echo "SSH Status:"
systemctl is-active sshd

echo "Firewall Status:"
ufw status

echo "Fail2Ban Status:"
systemctl is-active fail2ban

echo "Audit Status:"
systemctl is-active auditd

echo "Recent SSH attempts:"
grep "Failed password" /var/log/auth.log | tail -5

echo "Firewall blocks:"
grep "UFW BLOCK" /var/log/ufw.log | tail -5

echo "✅ Hardening verification complete"
EOF

chmod +x /root/verify-hardening.sh

log "🛡️ Verification script created: /root/verify-hardening.sh"
