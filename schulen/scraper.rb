require "mechanize"
require "mechanize/http/content_disposition_parser"
require "uri"
require "logger"

require 'nokogiri'
require 'open-uri'

# require 'builder'
# require 'mail'
# require 'time'
require "json"
require 'open3'
require 'csv'

require 'mapquest'


class School
  attr_accessor :name, :uri, :address, :type, :info, :email, :web, :ortsteile, :angebote
 
  def initialize(name, uri, type)
    @name = name
    @uri = uri
    @type = type
    @address = Array.new
    @email = nil
    @web = nil
    @angebote = nil
    @ortsteile = Array.new
  end

  def to_s
    {'name' => name, 'uri' => uri, 'address' => address.join(" "), 'Ortsteile' => ortsteile.join(","), 'Web' => web, 'Email' => email, 'Info' => info}.to_s
  end
end


def getSchoolList(uri, type = 'Grundschule')
  schools = Array.new
  begin
    agent = Mechanize.new
    page = agent.get(uri)
    
    
    doc = Nokogiri::HTML(page.body)
    doc.css('a.name').each do |schoolLinkElement|
      schoolUri = schoolLinkElement['href']
      if !schoolUri.start_with?('http://')
        schoolUri = 'http://www.leipzig.de/' + schoolUri
      end
      schoolName = schoolLinkElement.text
      
      school = School.new(schoolName, schoolUri, type)
      schools.push(school)
    end
    agent.shutdown()
    
  rescue Mechanize::ResponseReadError => e
    page = e.force_parse
  end
  
  schools
end

def getSchoolData(school)
  begin
    puts "Processing #{school.name}"

    agent = Mechanize.new
    page = agent.get(school.uri)
    
    doc = Nokogiri::HTML(page.body)

    address = Array.new
#     doc.xpath('//*[@id="page"]/table/tr/td[3]/table[3]/tr[2]/td[1]/table/tr[1]/td/p').each do |addressContent|
    doc.css('.tx_ewerkaddressdatabase .address').each do |addressContent|
      address = Hash.new 
      address['address'] = addressContent.xpath('text()').to_s.delete("\t").gsub("\n", ",")
      school.address.push( address )
    end
    
    doc.xpath('//*[@class="structured-list"]/ul/li[contains(text(),"E-Mail")]/following-sibling::li/a/text()').each do |info|
      school.email = info.to_s.delete("\n").delete("\t")
    end
    doc.xpath('//*[@class="structured-list"]/ul/li[contains(text(),"Internet")]/following-sibling::li/a/text()').each do |info|
      school.web = info.to_s.delete("\n").delete("\t")
    end
    doc.xpath('//*[@class="structured-list"]/ul/li[contains(text(),"Ortsteil")]/following-sibling::li/text()').each do |info|
      school.ortsteile.concat info.to_s.delete("\n").delete("\t").split(',')
    end
    doc.xpath('//*[@class="structured-list"]/ul/li[contains(text(),"Weitere schulische Angebote")]/following-sibling::li/text()').each do |info|
      school.angebote = info.to_s.delete("\n").delete("\t")
    end
    
    agent.shutdown()
  rescue Mechanize::ResponseReadError => e
    puts e
    page = e.force_parse
  end
end

schools = Array.new


#schools = getSchoolList("http://www.leipzig.de/jugend-familie-und-soziales/schulen-und-bildung/schulen/grundschulen/", "Grundschule")
schools = getSchoolList("http://www.leipzig.de/jugend-familie-und-soziales/schulen-und-bildung/schulen/grundschulen/?tx_ewerkaddressdatabase_pi[showAll]=1", "Grundschule")
  getSchoolList("http://www.leipzig.de/jugend-familie-und-soziales/schulen-und-bildung/schulen/oberschulen/?tx_ewerkaddressdatabase_pi[showAll]=1", "Oberschule").each do |school|
   schools.push(school)
 end
 getSchoolList("http://www.leipzig.de/jugend-familie-und-soziales/schulen-und-bildung/schulen/gemeinschaftsschule/?tx_ewerkaddressdatabase_pi[showAll]=1", "Gemeinschaftsschule").each do |school|
   schools.push(school)
 end
 getSchoolList("http://www.leipzig.de/jugend-familie-und-soziales/schulen-und-bildung/schulen/gymnasien/?tx_ewerkaddressdatabase_pi[showAll]=1", "Gymnasium").each do |school|
   schools.push(school)
 end
 getSchoolList("http://www.leipzig.de/jugend-familie-und-soziales/schulen-und-bildung/schulen/foerderschulen/?tx_ewerkaddressdatabase_pi[showAll]=1", "Foerderschule").each do |school|
   schools.push(school)
 end
 getSchoolList("http://www.leipzig.de/jugend-familie-und-soziales/schulen-und-bildung/schulen/berufliche-schulen/?tx_ewerkaddressdatabase_pi[showAll]=1", "Berufsschule").each do |school|
   schools.push(school)
 end


schools.each do |school|
  getSchoolData(school)
end


# geocode
mapquest = MapQuest.new "Fmjtd|luub2h6tnu,8n=o5-9uz000"
schools.each do |school|
  school.address.each do |address|
    puts "processing geocoding for #{address['address']}"
    data = mapquest.geocoding.address address['address']
    address['location'] = {:lat => data.locations[0][:latLng][:lat], :lng => data.locations[0][:latLng][:lng]} if data.info[:statuscode] == 0
  end
end


# puts schools


CSV.open("schools.csv", "w", {:col_sep => "\t"}) do |csv|

  csv << schools[0].instance_variables.map{|i| i.to_s.delete("@")}
  schools.each do |school|
    csv << school.instance_variables.map{|i| school.instance_variable_get i}
  end
end

