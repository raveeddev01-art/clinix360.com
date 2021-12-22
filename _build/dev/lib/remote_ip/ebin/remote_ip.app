{application,remote_ip,
             [{applications,[kernel,stdlib,elixir,plug,combine,inet_cidr]},
              {description,"A plug to overwrite the Conn's remote_ip based on headers such as X-Forwarded-For."},
              {modules,['Elixir.RemoteIp','Elixir.RemoteIp.Headers',
                        'Elixir.RemoteIp.Headers.Forwarded',
                        'Elixir.RemoteIp.Headers.Generic']},
              {registered,[]},
              {vsn,"0.1.5"}]}.
