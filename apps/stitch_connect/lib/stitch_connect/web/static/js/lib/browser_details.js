const unknown = "-";

// screen
let screenSize = "";
if (screen.width) {
  const width = screen.width ? screen.width : "";
  const height = screen.height ? screen.height : "";
  screenSize += `${width} x ${height}`;
}

// browser
const nVer = navigator.appVersion;
const nAgt = navigator.userAgent;
let browser = navigator.appName;
let version = `${parseFloat(navigator.appVersion)}`;
let majorVersion = parseInt(navigator.appVersion, 10);
let nameOffset;
let verOffset;
let ix;

// Opera
verOffset = nAgt.indexOf("Opera");
if (verOffset !== -1) {
  browser = "Opera";
  version = nAgt.substring(verOffset + 6);
  verOffset = nAgt.indexOf("Version");
  if (verOffset !== -1) {
    version = nAgt.substring(verOffset + 8);
  }
}
// Opera Next

if (nAgt.indexOf("OPR") !== -1) {
  verOffset = nAgt.indexOf("OPR");
  browser = "Opera";
  version = nAgt.substring(verOffset + 4);
} else if (nAgt.indexOf("Edge") !== -1) {
  // Edge
  verOffset = nAgt.indexOf("Edge");
  browser = "Microsoft Edge";
  version = nAgt.substring(verOffset + 5);
} else if (nAgt.indexOf("MSIE") !== -1) {
  // MSIE
  verOffset = nAgt.indexOf("MSIE");
  browser = "Microsoft Internet Explorer";
  version = nAgt.substring(verOffset + 5);
} else if (nAgt.indexOf("Chrome") !== -1) {
  // Chrome
  verOffset = nAgt.indexOf("Chrome");
  browser = "Chrome";
  version = nAgt.substring(verOffset + 7);
} else if (nAgt.indexOf("Safari") !== -1) {
  // Safari
  verOffset = nAgt.indexOf("Safari");
  browser = "Safari";
  version = nAgt.substring(verOffset + 7);
  verOffset = nAgt.indexOf("Version");
  if (verOffset !== -1) {
    version = nAgt.substring(verOffset + 8);
  }
} else if (nAgt.indexOf("Firefox") !== -1) {
  // Firefox
  verOffset = nAgt.indexOf("Firefox");
  browser = "Firefox";
  version = nAgt.substring(verOffset + 8);
} else if (nAgt.indexOf("Trident/") !== -1) {
  // MSIE 11+
  browser = "Microsoft Internet Explorer";
  version = nAgt.substring(nAgt.indexOf("rv:") + 3);
} else if (nAgt.lastIndexOf(" ") + 1 < nAgt.lastIndexOf("/")) {
  // Other browsers
  nameOffset = nAgt.lastIndexOf(" ") + 1;
  verOffset = nAgt.lastIndexOf("/");
  browser = nAgt.substring(nameOffset, verOffset);
  version = nAgt.substring(verOffset + 1);
  if (browser.toLowerCase() === browser.toUpperCase()) {
    browser = navigator.appName;
  }
}
// trim the version string
if (version.indexOf(";") !== -1) {
  ix = version.indexOf(";");
  version = version.substring(0, ix);
}
if (version.indexOf(" ") !== -1) {
  ix = version.indexOf(" ");
  version = version.substring(0, ix);
}
if (version.indexOf(")") !== -1) {
  ix = version.indexOf(")");
  version = version.substring(0, ix);
}

majorVersion = parseInt(version, 10);
if (isNaN(majorVersion)) {
  version = `${parseFloat(navigator.appVersion)}`;
  majorVersion = parseInt(navigator.appVersion, 10);
}

// mobile version
const mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

// cookie
let cookieEnabled = navigator.cookieEnabled === true;

if (typeof navigator.cookieEnabled === "undefined" && !cookieEnabled) {
  document.cookie = "testcookie";
  cookieEnabled = document.cookie.indexOf("testcookie") !== -1;
}

// system
let os = unknown;
const clientStrings = [
  { s: "Windows 10", r: /(Windows 10.0|Windows NT 10.0)/ },
  { s: "Windows 8.1", r: /(Windows 8.1|Windows NT 6.3)/ },
  { s: "Windows 8", r: /(Windows 8|Windows NT 6.2)/ },
  { s: "Windows 7", r: /(Windows 7|Windows NT 6.1)/ },
  { s: "Windows Vista", r: /Windows NT 6.0/ },
  { s: "Windows Server 2003", r: /Windows NT 5.2/ },
  { s: "Windows XP", r: /(Windows NT 5.1|Windows XP)/ },
  { s: "Windows 2000", r: /(Windows NT 5.0|Windows 2000)/ },
  { s: "Windows ME", r: /(Win 9x 4.90|Windows ME)/ },
  { s: "Windows 98", r: /(Windows 98|Win98)/ },
  { s: "Windows 95", r: /(Windows 95|Win95|Windows_95)/ },
  { s: "Windows NT 4.0", r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
  { s: "Windows CE", r: /Windows CE/ },
  { s: "Windows 3.11", r: /Win16/ },
  { s: "Android", r: /Android/ },
  { s: "Open BSD", r: /OpenBSD/ },
  { s: "Sun OS", r: /SunOS/ },
  { s: "Linux", r: /(Linux|X11)/ },
  { s: "iOS", r: /(iPhone|iPad|iPod)/ },
  { s: "Mac OS X", r: /Mac OS X/ },
  { s: "Mac OS", r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
  { s: "QNX", r: /QNX/ },
  { s: "UNIX", r: /UNIX/ },
  { s: "BeOS", r: /BeOS/ },
  { s: "OS/2", r: /OS\/2/ },
  {
    s: "Search Bot",
    r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
  }
];

for (let id = 0; id < clientStrings.length; id += 1) {
  const cs = clientStrings[id];
  if (cs.r.test(nAgt)) {
    os = cs.s;
    break;
  }
}

let osVersion = unknown;

if (/Windows/.test(os)) {
  osVersion = /Windows (.*)/.exec(os)[1];
  os = "Windows";
}

switch (os) {
  case "Mac OS X":
    osVersion = /Mac OS X (10[._\d]+)/.exec(nAgt)[1];
    break;

  case "Android":
    osVersion = /Android ([._\d]+)/.exec(nAgt)[1];
    break;

  case "iOS":
    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
    osVersion = `${osVersion[1]}.${osVersion[2]}.${osVersion[3] || 0}`;
    break;
  default:
}

export default {
  browser,
  browserVersion: version,
  browserMajorVersion: majorVersion,
  screenSize,
  mobile,
  os,
  osVersion,
  cookieEnabled
};
