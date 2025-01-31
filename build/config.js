var Configs = {
    tenant: [{
        tenant_name: "localhost",
        api_url: "http://192.168.100.14:8084",
        home_url: "http://live.assetpro.com.ph/"
    }]
};

var SubDomain = window.location.hostname.split(".")[0];
var CfgIdx = Configs.tenant.findIndex(({ tenant_name }) => String(tenant_name).toUpperCase() === String(SubDomain).toUpperCase());
