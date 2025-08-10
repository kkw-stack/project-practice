const withImages = require( 'next-images' );

module.exports = withImages( {
    env: {
        DOMAIN: process.env.DOMAIN,
    },
    trailingSlash: true,
    // useFileSystemPublicRoutes: false,
    productionBrowserSourceMaps: true,
    experimental: {
        scrollRestoration: false, // 실험적, 불안정함
    },
    module: {
        rules: [
            {
                exclude: [
                    '/cmsadmin/'
                ]
            }
        ]
    }
} );
