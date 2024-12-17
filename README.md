# BOCC Website

## Ruby Setup
1. Install ``rbenv`` and ``ruby-build`` for an isolated enviroment. ``brew install rbenv ruby-build``
1. Make sure these are in the path 
1. Use the Gemfile to specify what you need for the project 
1. Install Gems to a Local Path ``bundle config set --local path 'vendor/bundle'`` then ``bundle install`` to install all the Gems
1. Run commands vs the local set using ``bundle exec COMMAND.....``


## Local Testing 
1. Generated the basic site using ``bundle exec jekyll new --skip-bundle . --force`` per [docs](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll)
1. To make sure we can test the site using the Eventbrite [embed checkout](https://www.eventbrite.com/help/en-us/articles/347218/how-to-sell-eventbrite-tickets-on-your-website-through-an-embedded-checkout/) generate a self signed SSL Certificate
  1. The Keys are self-signed so there shouldn't be an issue with them on Github, but just to be safe add ``ssl/*``, ``*.key``, and ``*.cert`` to ``.Gitignore``
  1. Create an SSL directory in the local branch
  1. Generate the self-signed cert. You can generate fake info except for **Common Name (CN)** which must be ``localhost``. ``openssl req -new -x509 -key localhost.key -out localhost.crt -days 365``
1. Generate and run the basic site using ``bundle exec jekyll serve --host localhost --ssl-key ssl/localhost.key --ssl-cert ssl/localhost.crt``. Since we're using TLS use this vs the normal `` ``bundle exec jekyll serve``


## Theme 
1. Based the theme off of [minimal-mistakes](https://github.com/mmistakes/minimal-mistakes)
1. Added ``gem "minimal-mistakes-jekyll"`` to Gemfile, installed using bundle, and then added ``theme: minimal-mistakes-jekyll`` to ``_config.yml``
