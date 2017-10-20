defmodule Stitch.Blacklist do
  def blacklisted_subdomains do
    [
      "www", 
      "admin", 
      "help", 
      "support", 
      "billing", 
      "connect", 
      "engage", 
      "app", 
      "manage"
    ]
  end
end