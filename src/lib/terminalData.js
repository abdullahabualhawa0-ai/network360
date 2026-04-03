// Terminal commands per topic. Each topic has a "context" (device prompt) and command responses.
const terminalData = {
  "mac-addresses": {
    device: "Switch",
    prompt: "Switch#",
    description: "جرب أوامر المحول للتعرف على عناوين MAC",
    commands: {
      "show mac address-table": {
        output: `          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0010.1111.aaaa    DYNAMIC     Fa0/1
   1    0010.2222.bbbb    DYNAMIC     Fa0/2
   1    0010.3333.cccc    DYNAMIC     Fa0/3
   1    aaaa.bbbb.cccc    STATIC      Fa0/4
Total Mac Addresses for this criterion: 4`
      },
      "show mac address-table count": {
        output: `Mac Entries for Vlan 1:
---------------------------
Dynamic Address Count  :   3
Static  Address Count  :   1
Total Mac Addresses    :   4`
      },
      "show interfaces fa0/1": {
        output: `FastEthernet0/1 is up, line protocol is up (connected)
  Hardware is Lance, address is 0010.1111.aaaa (bia 0010.1111.aaaa)
  MTU 1500 bytes, BW 100000 Kbit, DLY 1000 usec,
  Full-duplex, 100Mb/s
  input flow-control is off, output flow-control is off
  Auto-duplex, Auto-speed`
      },
      "clear mac address-table dynamic": {
        output: `MAC address table cleared.`
      },
      "show arp": {
        output: `Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  192.168.1.1             -   aabb.ccdd.eeff  ARPA   Vlan1
Internet  192.168.1.10            2   0010.1111.aaaa  ARPA   Vlan1
Internet  192.168.1.20            5   0010.2222.bbbb  ARPA   Vlan1`
      }
    }
  },
  "ipv4-addresses": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر التحقق من عناوين IPv4",
    commands: {
      "show ip interface brief": {
        output: `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.1.1     YES NVRAM  up                    up
GigabitEthernet0/1     10.0.0.1        YES NVRAM  up                    up
GigabitEthernet0/2     unassigned      YES NVRAM  administratively down down
Loopback0              1.1.1.1         YES NVRAM  up                    up`
      },
      "show ip route": {
        output: `Codes: L - local, C - connected, S - static, R - RIP, O - OSPF

Gateway of last resort is 10.0.0.2 to network 0.0.0.0

C     10.0.0.0/30 is directly connected, GigabitEthernet0/1
L     10.0.0.1/32 is directly connected, GigabitEthernet0/1
C     192.168.1.0/24 is directly connected, GigabitEthernet0/0
L     192.168.1.1/32 is directly connected, GigabitEthernet0/0
S*    0.0.0.0/0 [1/0] via 10.0.0.2`
      },
      "show interfaces gi0/0": {
        output: `GigabitEthernet0/0 is up, line protocol is up
  Hardware is ISR4331-3x1GE, address is aabb.ccdd.1100 (bia aabb.ccdd.1100)
  Internet address is 192.168.1.1/24
  MTU 1500 bytes, BW 1000000 Kbit/sec
  Full Duplex, 1000Mbps, link type is auto`
      },
      "ping 192.168.1.10": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.1.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`
      },
      "ping 8.8.8.8": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 8.8.8.8, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 10/15/22 ms`
      }
    }
  },
  "dhcp": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص خادم DHCP",
    commands: {
      "show ip dhcp binding": {
        output: `Bindings from all pools not associated with VRF:
IP address       Client-ID/              Lease expiration        Type
                 Hardware address/
                 User name
192.168.1.100    0100.1122.3344.55       Apr 04 2026 08:00 AM    Automatic
192.168.1.101    0100.aabb.ccdd.ee       Apr 04 2026 09:30 AM    Automatic
192.168.1.102    0100.1234.5678.9a       Apr 04 2026 10:15 AM    Automatic`
      },
      "show ip dhcp pool": {
        output: `Pool OFFICE :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
 Leased addresses               : 3
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased addresses
 192.168.1.103        192.168.1.1      - 192.168.1.254     3`
      },
      "show ip dhcp server statistics": {
        output: `Memory usage         35063
Address pools        1
Database agents      0
Automatic bindings   3
Manual bindings      0
Expired bindings     0
Malformed messages   0
Secure arp entries   0

Message              Received
BOOTREQUEST          0
DHCPDISCOVER         5
DHCPREQUEST          3
DHCPDECLINE          0
DHCPRELEASE          2
DHCPINFORM           0

Message              Sent
BOOTREPLY            0
DHCPOFFER            5
DHCPACK              3
DHCPNAK              0`
      },
      "show running-config | section dhcp": {
        output: `ip dhcp excluded-address 192.168.1.1 192.168.1.10
!
ip dhcp pool OFFICE
 network 192.168.1.0 255.255.255.0
 default-router 192.168.1.1
 dns-server 8.8.8.8
 lease 1`
      }
    }
  },
  "nat": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص NAT",
    commands: {
      "show ip nat translations": {
        output: `Pro Inside global      Inside local       Outside local      Outside global
tcp 203.0.113.10:80   192.168.1.10:80    ---                ---
tcp 203.0.113.11:80   192.168.1.11:80    ---                ---
--- 203.0.113.12      192.168.1.12       ---                ---`
      },
      "show ip nat statistics": {
        output: `Total active translations: 3 (2 static, 1 dynamic; 0 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
Hits: 156  Misses: 0
CEF Translated packets: 156, CEF Punted packets: 0
Expired translations: 12
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 pool NAT_POOL refcount 1
 pool NAT_POOL: netmask 255.255.255.0
        start 203.0.113.10 end 203.0.113.20
        type generic, total addresses 11, allocated 1 (9%), misses 0`
      },
      "clear ip nat translation *": {
        output: `NAT translations cleared.`
      },
      "show running-config | include nat": {
        output: `ip nat inside source static 192.168.1.10 203.0.113.10
ip nat inside source static 192.168.1.11 203.0.113.11
 ip nat inside
 ip nat outside`
      }
    }
  },
  "pat": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص PAT/NAT Overload",
    commands: {
      "show ip nat translations": {
        output: `Pro Inside global        Inside local           Outside local      Outside global
tcp 203.0.113.1:2001    192.168.1.10:1025      8.8.8.8:53         8.8.8.8:53
tcp 203.0.113.1:2002    192.168.1.11:1026      142.250.80.46:80   142.250.80.46:80
tcp 203.0.113.1:2003    192.168.1.12:1025      93.184.216.34:443  93.184.216.34:443
udp 203.0.113.1:3001    192.168.1.10:5353      8.8.8.8:53         8.8.8.8:53`
      },
      "show ip nat statistics": {
        output: `Total active translations: 4 (0 static, 4 dynamic; 4 extended)
Outside interfaces: GigabitEthernet0/1
Inside interfaces:  GigabitEthernet0/0
Hits: 1432  Misses: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 interface GigabitEthernet0/1 refcount 4
Overloading enabled, using port allocation: 2048-65535`
      },
      "show access-lists 1": {
        output: `Standard IP access list 1
    10 permit 192.168.1.0, wildcard bits 0.0.0.255 (1432 matches)`
      }
    }
  },
  "vlan-cli": {
    device: "Switch",
    prompt: "Switch#",
    description: "جرب أوامر إعداد VLAN",
    commands: {
      "show vlan brief": {
        output: `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/5, Fa0/6, Fa0/7, Fa0/8
10   Sales                            active    Fa0/1, Fa0/2
20   Accounting                       active    Fa0/3, Fa0/4
30   IT                               active    Fa0/9, Fa0/10
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`
      },
      "show interfaces trunk": {
        output: `Port        Mode         Encapsulation  Status        Native vlan
Gi0/1       on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/1       10,20,30

Port        Vlans allowed and active in management domain
Gi0/1       10,20,30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,20,30`
      },
      "show interfaces fa0/1 switchport": {
        output: `Name: Fa0/1
Switchport: Enabled
Administrative Mode: static access
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: Off
Access Mode VLAN: 10 (Sales)
Trunking Native Mode VLAN: 1 (default)`
      },
      "show spanning-tree vlan 10": {
        output: `VLAN0010
  Spanning tree enabled protocol ieee
  Root ID    Priority    32778
             Address     aabb.ccdd.1100
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     aabb.ccdd.1100
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Fa0/1               Desg FWD 19        128.1    P2p
Fa0/2               Desg FWD 19        128.2    P2p
Gi0/1               Desg FWD 4         128.25   P2p`
      }
    }
  },
  "static-routing": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر التوجيه الثابت",
    commands: {
      "show ip route": {
        output: `Codes: L - local, C - connected, S - static

Gateway of last resort is 10.0.0.2 to network 0.0.0.0
S*    0.0.0.0/0 [1/0] via 10.0.0.2
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.0.0.0/30 is directly connected, GigabitEthernet0/1
L        10.0.0.1/32 is directly connected, GigabitEthernet0/1
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/0
L        192.168.1.1/32 is directly connected, GigabitEthernet0/0
S     192.168.2.0/24 [1/0] via 10.0.0.2
S     192.168.3.0/24 [1/0] via 10.0.0.2`
      },
      "show ip route static": {
        output: `Codes: S - static

S*    0.0.0.0/0 [1/0] via 10.0.0.2
S     192.168.2.0/24 [1/0] via 10.0.0.2
S     192.168.3.0/24 [1/0] via 10.0.0.2`
      },
      "ping 192.168.2.1": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.2.1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/5 ms`
      },
      "ping 192.168.99.1": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.99.1, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)`
      },
      "traceroute 192.168.3.10": {
        output: `Type escape sequence to abort.
Tracing the route to 192.168.3.10

  1   10.0.0.2        1 msec  1 msec  1 msec
  2   10.0.1.2        2 msec  2 msec  3 msec
  3   192.168.3.10    3 msec  3 msec  4 msec`
      }
    }
  },
  "ospf": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص OSPF",
    commands: {
      "show ip ospf neighbor": {
        output: `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/DR         00:00:33    10.0.0.2        GigabitEthernet0/1
3.3.3.3           1   FULL/BDR        00:00:38    10.0.1.2        GigabitEthernet0/2`
      },
      "show ip ospf": {
        output: `Routing Process "ospf 1" with ID 1.1.1.1
 Start time: 00:01:30.000, Time elapsed: 02:15:45.123
 Supports only single TOS(TOS0) routes
 Supports opaque LSA
 Supports Link-local Signaling (LLS)
 It is an area border and autonomous system boundary router
 Number of areas in this router is 1. 1 normal 0 stub 0 nssa
 Number of interfaces in this router is 3
   Area BACKBONE(0)
       Number of interfaces in this area is 3
       SPF algorithm last executed 00:02:10.456 ago
       Number of LSA 6. Checksum Sum 0x028FCA`
      },
      "show ip ospf interface gi0/1": {
        output: `GigabitEthernet0/1 is up, line protocol is up
  Internet Address 10.0.0.1/30, Area 0, Attached via Network Statement
  Process ID 1, Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 1.1.1.1, Interface address 10.0.0.1
  Backup Designated router (ID) 2.2.2.2, Interface address 10.0.0.2
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
  Hello due in 00:00:02
  Neighbor Count is 1, Adjacent neighbor count is 1`
      },
      "show ip route ospf": {
        output: `Codes: O - OSPF

O     172.16.1.0/24 [110/2] via 10.0.0.2, 02:10:15, GigabitEthernet0/1
O     172.16.2.0/24 [110/3] via 10.0.0.2, 02:10:15, GigabitEthernet0/1
O     192.168.10.0/24 [110/2] via 10.0.1.2, 01:50:30, GigabitEthernet0/2`
      }
    }
  },
  "rip": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص RIP",
    commands: {
      "show ip rip database": {
        output: `192.168.1.0/24    auto-summary
192.168.1.0/24    directly connected, GigabitEthernet0/0
192.168.2.0/24
    [2] via 10.0.0.2, 00:00:12, GigabitEthernet0/1
192.168.3.0/24
    [3] via 10.0.0.2, 00:00:12, GigabitEthernet0/1
10.0.0.0/30       auto-summary
10.0.0.0/30       directly connected, GigabitEthernet0/1`
      },
      "show ip protocols": {
        output: `*** IP Routing is NSF aware ***

Routing Protocol is "rip"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Sending updates every 30 seconds, next due in 17 seconds
  Invalid after 180 seconds, hold down 180, flushed after 240
  Redistributing: rip
  Default version control: send version 2, receive version 2
    Interface             Send  Recv  Triggered RIP  Key-chain
    GigabitEthernet0/0    2     2
    GigabitEthernet0/1    2     2
  Automatic network summarization is not in effect
  Maximum path: 4
  Routing for Networks:
    10.0.0.0
    192.168.1.0
  Routing Information Sources:
    Gateway         Distance      Last Update
    10.0.0.2             120      00:00:12
  Distance: (default is 120)`
      },
      "show ip route rip": {
        output: `Codes: R - RIP

R     192.168.2.0/24 [120/1] via 10.0.0.2, 00:00:12, GigabitEthernet0/1
R     192.168.3.0/24 [120/2] via 10.0.0.2, 00:00:12, GigabitEthernet0/1`
      },
      "debug ip rip": {
        output: `RIP protocol debugging is on
RIP: sending v2 update to 224.0.0.9 via GigabitEthernet0/0 (192.168.1.1)
RIP: build update entries
      192.168.2.0/24 via 0.0.0.0, metric 2, tag 0
      192.168.3.0/24 via 0.0.0.0, metric 3, tag 0
RIP: received v2 update from 10.0.0.2 on GigabitEthernet0/1
      192.168.2.0/24 -> 0.0.0.0 in 1 hops
      192.168.3.0/24 -> 0.0.0.0 in 2 hops`
      }
    }
  },
  "tracert-rip": {
    device: "Router",
    prompt: "Router#",
    description: "جرب Traceroute والأوامر المرتبطة",
    commands: {
      "traceroute 192.168.3.10": {
        output: `Type escape sequence to abort.
Tracing the route to 192.168.3.10
VRF info: (vrf in name/id, vrf out name/id)
  1   10.0.0.2 [AS 1]  2 msec  1 msec  2 msec
  2   10.0.1.2 [AS 1]  3 msec  3 msec  4 msec
  3   192.168.3.10 [AS 1]  5 msec  4 msec  5 msec`
      },
      "ping 192.168.3.10": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.3.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 4/5/8 ms`
      },
      "show ip route": {
        output: `R     192.168.2.0/24 [120/1] via 10.0.0.2, 00:00:08, GigabitEthernet0/1
R     192.168.3.0/24 [120/2] via 10.0.0.2, 00:00:08, GigabitEthernet0/1
C     192.168.1.0/24 is directly connected, GigabitEthernet0/0
C     10.0.0.0/30 is directly connected, GigabitEthernet0/1`
      },
      "traceroute 10.0.0.2": {
        output: `Tracing the route to 10.0.0.2
  1   10.0.0.2  1 msec  1 msec  1 msec`
      }
    }
  },
  "switch-security": {
    device: "Switch",
    prompt: "Switch#",
    description: "جرب أوامر أمان المحول",
    commands: {
      "show port-security": {
        output: `Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
              (Count)        (Count)       (Count)
---------------------------------------------------------------------------
      Fa0/1              1              1                 0         Shutdown
      Fa0/2              1              1                 0         Restrict
      Fa0/3              2              1                 0         Protect
---------------------------------------------------------------------------
Total Addresses in System (excluding one mac per port)     : 0
Max Addresses limit in System (excluding one mac per port) : 4096`
      },
      "show port-security interface fa0/1": {
        output: `Port Security              : Enabled
Port Status               : Secure-up
Violation Mode            : Shutdown
Aging Time                : 0 mins
Aging Type                : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 0010.1111.aaaa:1
Security Violation Count   : 0`
      },
      "show port-security address": {
        output: `               Secure Mac Address Table
-----------------------------------------------------------------------------
Vlan    Mac Address       Type                          Ports   Remaining Age
                                                                   (mins)
----    -----------       ----                          -----   -------------
   1    0010.1111.aaaa    SecureSticky                  Fa0/1        -
   1    0010.2222.bbbb    SecureSticky                  Fa0/2        -
   1    0010.3333.cccc    SecureConfigured              Fa0/3        -
-----------------------------------------------------------------------------
Total Addresses in System (excluding one mac per port)     : 2
Max Addresses limit in System (excluding one mac per port) : 4096`
      },
      "show interfaces fa0/1 status": {
        output: `Port      Name               Status       Vlan       Duplex  Speed Type
Fa0/1                        connected    1          a-full  a-100 10/100BaseTX`
      }
    }
  },
  "router-security": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص أمان جهاز التوجيه",
    commands: {
      "show running-config | include password": {
        output: `enable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0
 password 7 08701E1D5D4C
line vty 0 4
 password 7 060506324F41`
      },
      "show running-config | include banner": {
        output: `banner motd ^C
*** تحذير: الوصول غير المصرح به ممنوع ***
*** جميع الأنشطة مراقبة ومسجلة ***
^C`
      },
      "show users": {
        output: `    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
   2 vty 0    admin      192.168.1.10         00:02:15`
      },
      "show line vty 0 4": {
        output: `   Tty Typ     Tx/Rx    A Modem  Roty AccO AccI   Uses   Noise  Overruns   Int
*    2 VTY  9600/9600  -    -      -    -    -      3       0     0/0       -
     3 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -
     4 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -

 Transport input: ssh
 Transport output: ssh`
      },
      "show version": {
        output: `Cisco IOS Software, Version 15.4(3)M2
Technical Support: http://www.cisco.com/techsupport
ROM: System Bootstrap, Version 15.4(3r)M2

Router uptime is 2 days, 5 hours, 30 minutes
System image file is "flash:c2900-universalk9-mz.SPA.154-3.M2.bin"

Cisco CISCO2911/K9 (revision 1.0) with 491520K/32768K bytes of memory.
Processor board ID FTX152400KS
3 Gigabit Ethernet interfaces
1 Serial interface
DRAM configuration is 64 bits wide with parity disabled.
255K bytes of non-volatile configuration memory.
250880K bytes of ATA System CompactFlash 0 (Read/Write)`
      }
    }
  },
  "standard-acl-1": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر فحص قوائم التحكم بالوصول",
    commands: {
      "show access-lists": {
        output: `Standard IP access list 1
    10 permit 192.168.10.0, wildcard bits 0.0.0.255 (125 matches)
    20 deny   192.168.20.0, wildcard bits 0.0.0.255 (47 matches)
    30 permit any (312 matches)
Standard IP access list 2
    10 permit host 192.168.1.10 (23 matches)
    20 deny   any`
      },
      "show ip access-lists": {
        output: `Standard IP access list 1
    10 permit 192.168.10.0, wildcard bits 0.0.0.255 (125 matches)
    20 deny   192.168.20.0, wildcard bits 0.0.0.255 (47 matches)
    30 permit any (312 matches)`
      },
      "show ip interface gi0/1": {
        output: `GigabitEthernet0/1 is up, line protocol is up
  Internet address is 10.0.0.1/30
  Broadcast address is 255.255.255.255
  Inbound  access list is not set
  Outbound access list is 1
  Proxy ARP is enabled`
      },
      "show running-config | include access-list": {
        output: `access-list 1 permit 192.168.10.0 0.0.0.255
access-list 1 deny 192.168.20.0 0.0.0.255
access-list 1 permit any
access-list 2 permit host 192.168.1.10
access-list 2 deny any`
      }
    }
  },
  "telnet-router": {
    device: "Router",
    prompt: "Router#",
    description: "جرب أوامر إعداد والتحقق من Telnet/SSH",
    commands: {
      "show line vty 0 4": {
        output: `   Tty Typ     Tx/Rx    A Modem  Roty AccO AccI   Uses   Noise  Overruns   Int
     2 VTY  9600/9600  -    -      -    -    -      5       0     0/0       -
     3 VTY  9600/9600  -    -      -    -    -      2       0     0/0       -
     4 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -
     5 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -
     6 VTY  9600/9600  -    -      -    -    -      0       0     0/0       -

 Transport input: telnet ssh
 Transport output: telnet ssh`
      },
      "show users": {
        output: `    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
   2 vty 0    admin      192.168.1.50         00:01:30
   3 vty 1    student    192.168.1.51         00:05:00`
      },
      "show ssh": {
        output: `Connection  Version  Mode  Encryption   Hmac         State                 Username
0           2.0      IN    aes128-cbc   hmac-sha1    Session started          admin
0           2.0      OUT   aes128-cbc   hmac-sha1    Session started          admin
%No SSHv1 server connections running.`
      },
      "show crypto key mypubkey rsa": {
        output: `% Key pair was generated at: 09:00:00 Apr 3 2026
Key name: R1.lab.com
Key type: RSA KEYS
 Storage Device: private-config
 Usage: General Purpose Key
 Key is not exportable.
 Key Data:
  30820122 300D0609 2A864886 F70D0101 01050003 82010F00 30820...`
      },
      "ping 192.168.1.1": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.1.1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/1 ms`
      }
    }
  },
  "telnet-switch": {
    device: "Switch",
    prompt: "Switch#",
    description: "جرب أوامر إعداد SVI و Telnet للمحول",
    commands: {
      "show ip interface brief": {
        output: `Interface              IP-Address      OK? Method Status                Protocol
Vlan1                  192.168.1.2     YES NVRAM  up                    up
FastEthernet0/1        unassigned      YES unset  up                    up
FastEthernet0/2        unassigned      YES unset  up                    up
FastEthernet0/3        unassigned      YES unset  down                  down`
      },
      "show interface vlan 1": {
        output: `Vlan1 is up, line protocol is up
  Hardware is CPU Interface, address is aabb.ccdd.0001 (bia aabb.ccdd.0001)
  Internet address is 192.168.1.2/24
  MTU 1500 bytes, BW 100000 Kbit/sec
  Reliability 255/255, txload 1/255, rxload 1/255
  5 minute input rate 0 bits/sec, 0 packets/sec
  5 minute output rate 0 bits/sec, 0 packets/sec`
      },
      "show running-config | section vty": {
        output: `line vty 0 15
 password 7 060506324F41
 login
 transport input telnet ssh`
      },
      "show users": {
        output: `    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
   2 vty 0               192.168.1.100        00:00:45`
      },
      "ping 192.168.1.1": {
        output: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.1.1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/3 ms`
      }
    }
  }
};

export default terminalData;